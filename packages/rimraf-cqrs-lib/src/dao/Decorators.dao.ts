import Debug from "debug";
import { IDao } from "./IDao";
import { DomainEvent } from "../types";
import { RabbitMqConnection } from "rimraf-rabbitmq";

export class LoggerDao implements IDao {

    private logger = Debug("Dao");
    constructor(private component: IDao) { }
    load(id: string, aggName: string): Promise<DomainEvent<any>[]> {
        this.logger('🧻 load: %s id: %s', aggName, id);
        return this.component.load(id, aggName);
    }
    insertEvent(event: DomainEvent<any>, aggName: string): Promise<void> {
        this.logger('✍ insertEvent: %s: %O', aggName, event);
        return this.component.insertEvent(event, aggName);
    }

    close(): Promise<void> {
        return this.component.close();
    }

}

export class RabbitSender implements IDao {

    constructor( private rabbitMq: RabbitMqConnection,private component: IDao) {}
    load(id: string, aggName: string): Promise<DomainEvent<any>[]> {
        return this.component.load(id, aggName);
    }
    async insertEvent(event: DomainEvent<any>, aggName: string): Promise<void> {
        await this.component.insertEvent(event, aggName);
        return (await this.rabbitMq).publisher(aggName, event);
    }
    async close(): Promise<void> {
        await this.component.close();
        await (await this.rabbitMq).close()
    }

}