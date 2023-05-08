export * from "./src";

export type Reducer<TEventDef, TState> = {
  [K in keyof TEventDef]?: (
    payload: TEventDef[K],

    state: Readonly<TState>
  ) => Readonly<TState>;
};

export type Event<T> = {
  payload: T;
  name: string;
  timestamp: number;
  id: string;
};
