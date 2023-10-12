import { Inject, Logger } from "@nestjs/common";
import * as amqp from 'amqplib';
import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer, WebSocketGateway } from "@nestjs/websockets";
import { Server } from "socket.io";
import { Observable, share } from "rxjs";
import { Event } from 'rimraf-cqrs-lib';
import { QueueReducer, ReadModelList } from "./ReadModel";
import { Db } from "mongodb";

@WebSocketGateway({ cors: '*' })
export class ListGateway
    implements OnGatewayInit {

    constructor(
        @Inject('ReadModelList') private lists: ReadModelList[],
        @Inject('EventBus') private eventBus: { [aggName: string]: Observable<Event<unknown>> },
        @Inject('ReadDataseConnection') private database: Db
    ) {
        this.logger.log(lists.map(p => `${p.ListName}`).join(","));
    }

    private logger: Logger = new Logger('ListGateway');

    afterInit(server: Server) {
        this.logger.log('Initialized');
        const availableAggregates = Object.keys(this.eventBus);

        for (const list of this.lists) {
            this.logger.log("start:" + list.ListName);
            const websocket = server.of(list.ListName);

            //schauen welche aggregate er behandelt?
            const listsHandler = availableAggregates
                .map(aggName => ({
                    aggName,
                    reducer: list.AggregateReducer(aggName)
                }))
                .filter((item) => item.reducer !== undefined)
                .map(p => p.aggName);


            listsHandler.forEach(
                aggName => this.eventBus[aggName].subscribe(
                    event => {
                        //this.logger.debug(event);
                        websocket.emit("event", event)
                    }
                )
            )


            const collection = this.database.collection(list.ListName);
            websocket.on("connection", (socket) => {
                this.logger.debug("client connect for list " + list.ListName);
                collection.find().toArray().then(currentStateList => {
                    socket.emit("initState", currentStateList)
                })
            })

        }
    }

}