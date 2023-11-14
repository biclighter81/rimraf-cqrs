
import Debug from "debug";
import { Namespace, Server } from "socket.io";
import { ConsumerNamespaceFunction, RabbitMqConnection } from "rimraf-rabbitmq";
import { Projection } from ".";
import { DomainEvent } from "../types";

interface ProjectionMediatorEntry<TAppEventBus> extends Projection<TAppEventBus> {
    webSocket: Namespace;
    logger: Debug.Debugger;
}

type SocketHub = ReturnType<RabbitMqConnection["listener"]>;
export class ProjectionMediator<TAppEventBus> {

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

    private workerQueue(
        propjectionConsumer: ConsumerNamespaceFunction<unknown>,
        projection: ProjectionMediatorEntry<TAppEventBus>,
        aggName: (keyof TAppEventBus) & string
    ) {
        propjectionConsumer(aggName, async (event) => {
            const eventHandler = projection.aggHandler[aggName];
            if (eventHandler != undefined) {
                projection.logger("workerQueue 💾 to %s for event %s", aggName, event.eventName);
                return eventHandler(event as any);
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