import Debug from "debug";
import { IDao } from "./IDao";
import { DomainEvent } from "../types";

export class LoggerDao implements IDao {

    private logger = Debug("Dao");
    constructor(private component: IDao) { }
    load(id: string, aggName: string): Promise<DomainEvent<any>[]> {
        this.logger('load: %s id: %s', aggName, id);
        return this.component.load(id, aggName);
    }
    insertEvent(event: DomainEvent<any>, aggName: string): Promise<void> {
        this.logger('insertEvent: %s: %O', aggName, event);
        return this.component.insertEvent(event, aggName);
    }

}
