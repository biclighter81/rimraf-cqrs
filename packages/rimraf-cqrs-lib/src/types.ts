
export type Reducer<TEventDef, TState> = {
  [K in keyof TEventDef]?: (
    payload: TEventDef[K],

    state: Readonly<TState>
  ) => Readonly<TState>;
};

export type DomainEvent<T, TEventName extends string = string> = {
  payload: T;
  eventName: TEventName;
  timestamp: number;
  aggId: string;
};

export interface IAggregatRepository<TEventDef, TAgg> {

  save<K extends keyof TEventDef>(eventName: K & string, payload: TEventDef[K]): Promise<void>;
  //save: IEventHandler<TEventDef, Promise<void>>;

  getState(
    id: string
  ): Promise<Readonly<TAgg> | null>
}

export interface IEventHandler<TEventDef, TReturn> {
  //<K extends keyof TEventDef>(eventName: K & string, payload: TEventDef[K]): TReturn;//Promise<void>;
  <K extends (keyof TEventDef) & string>(event: DomainEvent<TEventDef[K], K>): TReturn;
}

export type ProjectionHandler<TAppEventBus, TRet = void> = {
  [P in keyof TAppEventBus]?: IEventHandler<TAppEventBus[P], TRet>;
}

// export interface ProjectionHandlerFunc<TAppEventBus, TRet = void> {
//   <P extends keyof TAppEventBus>(aggName: P): IEventHandler<TAppEventBus[P], TRet>;
// }
