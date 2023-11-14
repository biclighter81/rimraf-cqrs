import { useEffect, useState } from "react";
import { Reducer } from "rimraf-cqrs-lib";
import { io } from "socket.io-client";

export const createUseReadModel = (url: string) => <T extends any[],>(listName: string, reducers: { aggName: string, aggReducer: Reducer<any, T> }[]) => {
    const [state, setState] = useState<T>()

    useEffect(() => {
        const socket = io(url + listName);
        
        reducers.forEach(({aggName,aggReducer})=>{
            socket.on(aggName, (event) => {
                setState(currentState => {
                    const reducer = aggReducer[event.eventName];
                    if (reducer !== undefined) {
                        const newState = reducer(event.payload, currentState||([] as unknown as T));
                        return newState;
                    }
                    return currentState
                })
            })
        })       

        socket.on("__init", (initState) => {
            setState(initState)
        })
        return () => {
            socket.close();
        }
    }, []);
    return state;
}