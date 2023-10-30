import * as dotenv from 'dotenv';
dotenv.config();

import * as express from "express";
import * as http from "http";
import { Namespace, Server } from "socket.io";
import Debug from "debug";
import { ConsumerNamespaceFunction, RabbitMqConnection, getRabbitMqConnection } from 'rimraf-rabbitmq';
import { AppEventBus, ArticleEvents } from 'types';
import { articleOverviewReducer } from 'read-reducer';
import { DomainEvent, IEventHandler, ProjectionHandler, Reducer } from 'rimraf-cqrs-lib';
import { Db, MongoClient, ObjectId, WithId, Document } from 'mongodb';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            PORT: number
        }
    }
}

io.on('connection', (socket) => {
    console.log('a user connected');
});

const port = process.env.PORT || 4001;
const logger = Debug("read-model");

server.listen(port, () => {
    logger('listening on *:%d', port);
});


const rabbtitServer = getRabbitMqConnection({
    hostname: process.env.MQTT_HOST,
    port: parseInt(process.env.MQTT_PORT as any),
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
});

const mongodb = async () => {
    const connection = await MongoClient.connect(process.env.MONGODB_URL as string);
    await connection.connect();
    const db = connection.db(process.env.MONGODB_DB as string);
    return db;
}

/////////////////////


interface Projection<TAppEventBus> {
    listName: string;
    aggHandler: ProjectionHandler<TAppEventBus, Promise<void>>;

    getState?: () => Promise<unknown>;
}


interface IProjectionMediator<TAppEventBus> {
    register(projection: Projection<TAppEventBus>): void;

    start(): Promise<void>;

}

interface ProjectionMediatorEntry<TAppEventBus> extends Projection<TAppEventBus> {
    webSocket: Namespace;
    logger: Debug.Debugger;
}

type SocketHub = ReturnType<RabbitMqConnection["listener"]>;
class ProjectionMediator<TAppEventBus> implements IProjectionMediator<TAppEventBus> {

    private readonly projections: { [listName: string]: ProjectionMediatorEntry<TAppEventBus> } = {};
    private socketHub: { [aggName: string]: SocketHub } = {};

    private logger = Debug("ProjectionMediator");

    constructor(
        private rabbitServer: RabbitMqConnection,
        private socketIoServer: Server
    ) { }

    register(projection: Projection<TAppEventBus>): void {
        const logger = this.logger.extend(projection.listName);

        logger("register 🎁");

        const webSocket = this.socketIoServer.of(projection.listName);
        const getState = projection.getState;
        if (getState !== undefined) {

            webSocket.on("connection", (socket) => {
                getState().then(state => {
                    socket.emit("__init", state);
                })
            });
        }

        this.projections[projection.listName] = { ...projection, webSocket, logger }
    }

    private getProjectionEventHandler(
        projection: Projection<TAppEventBus>,
        aggName: keyof TAppEventBus,
        event: DomainEvent<any>
    ): IEventHandler<any, Promise<void>> | undefined {

        const aggHandler = projection.aggHandler[aggName as keyof TAppEventBus];
        return aggHandler;
    }

    private workerQueue(
        propjectionConsumer: ConsumerNamespaceFunction<unknown>,
        projection: ProjectionMediatorEntry<TAppEventBus>,
        aggName: string
    ) {
        propjectionConsumer(aggName, async (event) => {
            //const eventHandler = this.getProjectionEventHandler(projection, aggName, event);
            const eventHandler = projection.aggHandler[aggName];
            if (eventHandler != undefined) {
                projection.logger("workerQueue 💾 to %s for event %s", aggName, event.eventName);
                return eventHandler(event);
            }
            return Promise.resolve()
        });
    }

    private pubSub(
        projection: ProjectionMediatorEntry<TAppEventBus>,
        aggName: Extract<keyof TAppEventBus, string>
    ) {
        if (this.socketHub[aggName] === undefined) {
            const listener = this.rabbitServer.listener(aggName);
            this.socketHub[aggName] = listener;
        }
        const socket = this.socketHub[aggName];
        socket.subscribe((event) => {
            projection.logger("relay 📢 to socket.io to %s for event %s", aggName, event.eventName);
            projection.webSocket.emit(aggName, event);
        })
    }
    async start(): Promise<void> {

        for (const listName in this.projections) {
            const projection = this.projections[listName];
            projection.logger("start 🐱‍🏍")

            const propjectionConsumer = await this.rabbitServer.consumer(listName);
            for (const aggName in projection.aggHandler) {
                projection.logger("🌳 consume %s", aggName);

                this.workerQueue(propjectionConsumer, projection, aggName);
                this.pubSub(projection, aggName);
            }
        }
        return Promise.resolve();
    }

}

////

class CommonMongoProjection<TAppEventBus> implements Projection<TAppEventBus>{

    constructor(public listName: string, private database: Db) {
    }

    public addReducer<P extends keyof TAppEventBus, TDto extends Document>(
        aggName: P,
        aggReducer: Reducer<TAppEventBus[P], TDto>,
        dtoField: keyof (TDto extends (infer U)[] ? U : TDto)
    ) {
        const aggHandler: IEventHandler<any, Promise<void>> = async (event) => {

            const collection = this.database.collection<TDto>(this.listName);

            const currentStateList = (await collection.find({ [dtoField]: event.aggId } as any).toArray());
            const reducer = aggReducer[event.eventName as any];
            if (reducer !== undefined) {
                const newStateList = reducer(event.payload, currentStateList || []);

                for (const newState of newStateList) {
                    if (newState._id === undefined)
                        await collection.insertOne(newState);
                    else {
                        const oldItem = currentStateList.find(p => p._id == newState._id)
                        if (oldItem === undefined)
                            throw "geht nicht";
                        else {
                            if (oldItem !== newState)
                                await collection.updateOne({ _id: new ObjectId(newState._id) } as any, { $set: newState } as any)
                        }
                    }
                }

                for (const existingItem of currentStateList) {
                    const oldItem = newStateList.find(p => p._id == existingItem._id);
                    if (oldItem === undefined)
                        await collection.deleteOne({ _id: new ObjectId(existingItem._id) } as any)
                }
            }
            return Promise.resolve()
        }
        this.aggHandler[aggName] = aggHandler;
        return this;
    }

    aggHandler: ProjectionHandler<TAppEventBus, Promise<void>> = {};
    getState = () => {
        const collection = this.database.collection(this.listName);
        return collection.find().toArray()
    };

}

/////
(async () => {
    const db = await mongodb();
    const d=articleOverviewReducer;
    const overview = new CommonMongoProjection<AppEventBus>("newlist", db)
        .addReducer("Article", articleOverviewReducer, "articleId")

    // const articleOverview: Projection<AppEventBus> = {
    //     listName: "articleOverview",
    //     handler: {
    //         Article: (event) => {

    //             return Promise.resolve();
    //         },
    //     }
    // }

    const mediator = new ProjectionMediator<AppEventBus>(await rabbtitServer, io);

    //mediator.register(articleOverview);
    mediator.register(overview)
    mediator.start();
})();
