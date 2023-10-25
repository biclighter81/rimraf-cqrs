import express from "express";
import http from "http";
import { Server } from "socket.io";
import Debug from "debug";

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