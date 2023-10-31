import * as http from "http";
import { RabbitMqConnection } from "rimraf-rabbitmq";
import { Server } from "socket.io";
import Debug from "debug";
import { Projection, ProjectionMediator } from ".";
import * as express from "express";
export const getProjectionServer = <TAppEventBus>(
    port: number,
    rabbitServer: RabbitMqConnection,
    projections: Projection<TAppEventBus>[]
) => {
    const expressApp = express();
    const server = http.createServer(expressApp);
    const io = new Server(server);

    const logger = Debug("read-model");

    server.listen(port, () => {
        logger('listening on *:%d', port);
    });

    const mediator = new ProjectionMediator<TAppEventBus>(rabbitServer, io);
    projections.forEach(mediator.register.bind(mediator))

    mediator.start();

    return async () => {
        logger("stopping ✋");
        rabbitServer.close();
        server.close();
    }
}