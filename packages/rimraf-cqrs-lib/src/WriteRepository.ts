
import { IDao } from "./dao";
import { IAggregatRepository, Reducer } from "./types";

export const databaseRepository = <TEventsbus>(dao: IDao) =>
    <TAggName extends (keyof TEventsbus) & string, TAgg>(
        aggName: TAggName,
        reducer: Reducer<TEventsbus[TAggName], TAgg>,
        idAccessor: (payload: TEventsbus[TAggName][keyof TEventsbus[TAggName]], eventName: string) => string
    ): IAggregatRepository<TEventsbus[TAggName], TAgg> => {
        return {
            save: (eventName, payload) => {
                const aggId = idAccessor(payload, eventName);
                if (!(aggId && aggId.length > 0))
                    throw "aggId is missing";

                const insertEvent = {
                    payload: payload,
                    eventName: eventName,
                    timestamp: new Date().getTime(),
                    aggId,
                };

                return dao.insertEvent(insertEvent, aggName);
            },
            getState: async (id) => {
                const events = await dao.load(id, aggName);
                if (!events?.length) return undefined;
                let state: any = {};
                for (const event of events) {
                    const eventFunc = (reducer as any)[event.eventName];
                    if (eventFunc !== undefined)
                        state = eventFunc(event.payload, state);
                }
                return state;
            }

        }
    }


