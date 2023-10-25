import * as dotenv from 'dotenv';
dotenv.config();

import * as express from "express";
import * as http from "http";
import { Server } from "socket.io";
import Debug from "debug";
import { getRabbitMqConnection } from 'rimraf-rabbitmq';
import { AppEventBus, ArticleEvents } from 'types';

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

rabbtitServer.then(server=>{
    server.consumer<ArticleEvents>("Article",(event)=>{
        
        return Promise.resolve();
    })
});

const projection = (listName:string, listen:Partial<AppEventBus>)=>{
    
}

const articleOverview=projection("articleOverview",{
    
});