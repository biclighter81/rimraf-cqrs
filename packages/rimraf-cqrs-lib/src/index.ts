
export { writeRepositoryFactory } from "./WriteRepository";

export type Reducer<TEventDef, TState> = {
  [K in keyof TEventDef]?: (
    payload: TEventDef[K],

    state: Readonly<TState>
  ) => Readonly<TState>;
};

export type Event<T> = {
  payload: T;
  eventName: string;
  timestamp: number;
  id: string;
};


export interface IAggregatRepository<TEvents, TAgg> {
  /**
   * returns id from aggregat
   * @param aggName 
   * @param eventName 
   */
  save: <R extends keyof TEvents>(eventName: keyof TEvents & string) => (payload: TEvents[R] & { id?: string }) => Promise<string>;
  getState(
    id: string
  ): Promise<Readonly<TAgg>>
}