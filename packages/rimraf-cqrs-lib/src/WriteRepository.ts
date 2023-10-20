
import { IDao } from "./dao";
import { IAggregatRepository, Reducer } from "./types";


export class DatabaseRepository<TEventDef, TAgg> implements IAggregatRepository<TEventDef, TAgg>{
    constructor(
        private reducer: Reducer<TEventDef, TAgg>,
        private aggName: string,
        private idAccessor: (payload: TEventDef[keyof TEventDef], eventName: string) => string,
        private dao: IDao
    ) { }
    async save<K extends keyof TEventDef>(eventName: K & string, payload: TEventDef[K]): Promise<void> {

        const id = this.idAccessor(payload, eventName);

        const event = {
            payload,
            eventName,
            timestamp: new Date().getTime(),
            id,
        };

        await this.dao.insertEvent(event, this.aggName);
    }
    async getState(id: string): Promise<Readonly<TAgg> | null> {
        const events = await this.dao.load(id, this.aggName);
        if (!events?.length) return null;
        let state: any = {};
        for (const event of events) {
            const eventFunc = (this.reducer[event.eventName]);
            if (eventFunc !== undefined)
                state = eventFunc(event, state);
        }
        return state;
    }

}

