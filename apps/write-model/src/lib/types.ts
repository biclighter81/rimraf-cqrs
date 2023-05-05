export type Reducer<TEventDef, TState> = {

    [K in keyof TEventDef]?: (

        payload: TEventDef[K],

        state: Readonly<TState>

    ) => Readonly<TState>;

}