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
import { Collection, Db, MongoClient, ObjectId, WithId, Document } from 'mongodb';

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


// interface IReadRepository {

// }

// interface Projection<TAppEventBus> {
//     (listName: string, reducers: ProjectionReducer<TAppEventBus>): void
// }

// const projection = <TAppEventBus>(): Projection<TAppEventBus> => {

//     const projections: { [listName: string]: ProjectionReducer<TAppEventBus> } = {};

//     return (listName: string, reducers: ProjectionReducer<TAppEventBus>) => {
//         projections[listName] = reducers;
//     }
// }

// const projections = projection<AppEventBus>()

// projections("articleOverview", {
//     Article: articleOverviewReducer
// });


/////////////////////


interface Projection<TAppEventBus> {
    listName: string;
    handler: ProjectionHandler<TAppEventBus, Promise<void>>;

    getState?: () => Promise<unknown>;
}


interface IProjectionMediator<TAppEventBus> {
    register(projection: Projection<TAppEventBus>): void;

    start(): Promise<void>;

}

interface ProjectionMediatorEntry<TAppEventBus> extends Projection<TAppEventBus> {
    webSocket: Namespace;
}

type SocketHub = ReturnType<RabbitMqConnection["listener"]>;
class ProjectionMediator<TAppEventBus> implements IProjectionMediator<TAppEventBus> {

    private readonly projections: { [listName: string]: ProjectionMediatorEntry<TAppEventBus> } = {};
    private socketHub: { [aggName: string]: SocketHub } = {};

    constructor(
        private rabbitServer: RabbitMqConnection,
        private socketIoServer: Server
    ) { }

    register(projection: Projection<TAppEventBus>): void {
        const webSocket = this.socketIoServer.of(projection.listName);
        const getState = projection.getState;
        if (getState !== undefined) {

            webSocket.on("connection", (socket) => {
                getState().then(state => {
                    socket.emit("__init", state);
                })
            });
        }

        this.projections[projection.listName] = { ...projection, webSocket }
    }

    private getProjectionEventHandler(
        projection: Projection<TAppEventBus>,
        aggName: keyof TAppEventBus,
        event: DomainEvent<any>
    ): IEventHandler<any, Promise<void>> | undefined {

        const aggHandler = projection.handler[aggName as keyof TAppEventBus];
        //const aggHandler = projection.handler(aggName);
        if (aggHandler !== undefined) {
            const eventHandler = aggHandler[event.eventName];
            return eventHandler;
        }
    }

    private workerQueue(
        propjectionConsumer: ConsumerNamespaceFunction<unknown>,
        projection: Projection<TAppEventBus>,
        aggName: Extract<keyof TAppEventBus, string>
    ) {
        propjectionConsumer(aggName, async (event) => {
            const eventHandler = this.getProjectionEventHandler(projection, aggName, event);
            if (eventHandler != undefined) {
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
            projection.webSocket.emit(aggName, event);
        })
    }
    async start(): Promise<void> {

        for (const listName in this.projections) {
            const projection = this.projections[listName];

            const propjectionConsumer = await this.rabbitServer.consumer(listName);
            for (const aggName in projection.handler) {
                this.workerQueue(propjectionConsumer, projection, aggName);
                this.pubSub(projection, aggName);
            }
        }
        return Promise.resolve();
    }

}

////

// export type ProjectionReducer<TEventDef,TDto> = {
//     [P in keyof TEventDef]?: [Reducer<TEventDef[P], TDto>,keyof TDto];
//   }


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
        this.handler[aggName] = aggHandler;
        return this;
    }

    handler: ProjectionHandler<TAppEventBus, Promise<void>> = {};
    getState = () => {
        const collection = this.database.collection(this.listName);
        return collection.find().toArray()
    };

}

/////
(async () => {
    const db = await mongodb();

    const overview = new CommonMongoProjection<AppEventBus>("newlist", db)
        .addReducer("Article", articleOverviewReducer, "articleId")

    const articleOverview: Projection<AppEventBus> = {
        listName: "articleOverview",
        handler: {
            Article: (event) => {

                return Promise.resolve();
            },
        }
    }

    const mediator = new ProjectionMediator<AppEventBus>(await rabbtitServer, io);

    mediator.register(articleOverview);
    mediator.register(overview)
    mediator.start();
})();
