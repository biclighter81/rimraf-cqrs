'use client'

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Reducer } from 'rimraf-cqrs-lib';
import { exampleReducer } from "read-reducer";
import { request } from 'graphql-request'

const useReadModel = <T extends any[],>(listName: string, aggReducer: Reducer<any, T>) => {
    const [state, setState] = useState<T>([] as any)

    useEffect(() => {
        const socket = io("http://localhost:4000/" + listName);

        socket.on("event", (event) => {
            setState(currentState => {
                const reducer = aggReducer[event.eventName];
                if (reducer !== undefined) {
                    const newState = reducer(event.payload, currentState);
                    return newState;
                }
                return currentState
            })
        })

        socket.on("initState", (initState) => {
            setState(initState)
        })
        return () => {
            socket.close();
        }
    }, []);
    return state;
}

export default function MyListComponent() {
    const mylist = useReadModel("MyList", exampleReducer)

    interface Rspo {
        id: string,
        errorMessage: string
    }
    interface ExampleCreatedInput { name: string }

    const createExample = (payload: ExampleCreatedInput):Promise<string> => {
        const document = `
        mutation ($payload: ExampleCreatedInput!) {
            createExample(payload: $payload) {
              id
              errorMessage
            }
          }          
        `
        return request<{ createExample: Rspo }>('http://localhost:3002/graphql', document, { payload }).then(p => {
            const response = p.createExample;
            if (response.errorMessage)
                throw response.errorMessage
            return response.id
        }).catch(err => {
            if (err instanceof Error)
                console.error(err);
            else
                throw err;
            return ""
        })
    }
    const add = async () => {
        try {
            await createExample({ name: "sty" });
        }
        catch (err) {
            debugger;
        }

        //         const document = `
        //         mutation ($payload: ExampleCreatedInput!) {
        //             createExample(payload: $payload) {
        //               id
        //               errorMessage
        //             }
        //           }

        // `
        //         request('http://localhost:3002/graphql', document, { payload: { name: "sty" } })
    }

    return (<div>
        <button onClick={() => { add() }}> add me</button>
        {mylist.map(p => <div><span className=" text-xs mr-4">{p.ExampleId}</span><span className=" text-xl">{p.name}</span></div>)}
    </div>)
}