import { randomUUID } from "crypto";
import { IAggregatRepository, Event, Reducer } from ".";

export interface WriteRepositoryFactory {
    <TEvents, TAgg>(reducer: Reducer<TEvents, TAgg>, aggName: string): IAggregatRepository<TEvents, TAgg>
}

export const writeRepositoryFactory = (dao: {
    load: (id: string, aggName: string) => Promise<Event<any>[]>,
    insertEvent: (event: Event<any>, aggName: string) => Promise<void>
}): WriteRepositoryFactory => (reducer, aggName) => ({
    save: (eventName) => {
        return async (payload) => {

            const id = payload.id || randomUUID();

            const event = {
                payload,
                eventName,
                timestamp: new Date().getTime(),
                id,
            };
            await dao.insertEvent(event, aggName);
            return id;
        }
    },
    getState: async (id) => {
        const events = await dao.load(id, aggName);
        if (!events?.length) return null;
        let state: any = {};
        for (const event of events) {
            const eventFunc = reducer[event.eventName];
            if (eventFunc !== undefined)
                state = eventFunc(event, state);
        }
        return state;
    },
})
