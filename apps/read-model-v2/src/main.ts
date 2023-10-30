import * as dotenv from 'dotenv';
dotenv.config();

import * as express from "express";
import * as http from "http";
import { Namespace, Server } from "socket.io";
import Debug from "debug";
import { ConsumerNamespaceFunction, RabbitMqConnection, getRabbitMqConnection } from 'rimraf-rabbitmq';
import { AppEventBus, ArticleEvents } from 'types';
import { articleOverviewReducer } from 'read-reducer';
import { DomainEvent, IEventHandler, ProjectionHandler, Reducer, IProjectionMediator, Projection, ProjectionMediator, propjectionFactory, CommonMongoProjection } from 'rimraf-cqrs-lib';
import { Db, MongoClient, ObjectId, Document } from 'mongodb';

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



////

/////
(async () => {
    const db = await mongodb();
    const projection = propjectionFactory<AppEventBus>(db);

    const articleOverview = projection("articleOverview")
        ("Article", articleOverviewReducer, "articleId");

    const mediator = new ProjectionMediator<AppEventBus>(await rabbtitServer, io);

    mediator.register(articleOverview)
    mediator.start();
})();
