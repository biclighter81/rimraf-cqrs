
export type Reducer<TEventDef, TState> = {
    [K in keyof TEventDef]?: (
      payload: TEventDef[K],
  
      state: Readonly<TState>
    ) => Readonly<TState>;
  };
  
  export type DomainEvent<T> = {
    payload: T;
    eventName: string;
    timestamp: number;
    id: string;
  };
  
  export interface IAggregatRepository<TEventDef, TAgg> {
    
    save<K extends keyof TEventDef>(eventName: K, payload: TEventDef[K]): Promise<void>;
  
    getState(
      id: string
    ): Promise<Readonly<TAgg> | null>
  }
  