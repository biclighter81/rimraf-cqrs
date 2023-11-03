'use client'

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Reducer } from 'rimraf-cqrs-lib';
import { articleOverviewReducer } from "read-reducer";
import { article } from "@/commands";

const createUseReadModel = (url: string) => <T extends any[],>(listName: string, aggReducer: Reducer<any, T>) => {
    const [state, setState] = useState<T>([] as any)

    useEffect(() => {
        const socket = io(url + listName);
        /////////////////////////todo article
        socket.on("Article", (event) => {
            setState(currentState => {
                const reducer = aggReducer[event.eventName];
                if (reducer !== undefined) {
                    const newState = reducer(event.payload, currentState);
                    return newState;
                }
                return currentState
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

const useReadModel = createUseReadModel("http://localhost:4001/")
export default function MyListComponent() {
    const mylist = useReadModel("articleOverview", articleOverviewReducer)
    const [state, setState] = useState({ name: "sty", editId: "", editText: "" });

    const add = async () => {
        try {
            await article.buildArticle({ name: state.name });
        }
        catch (err) {
            debugger;
        }

    }

    const save = async () => {
        try {
            //await setExampleText({ text: state.editText, id: state.editId });
            setState({ ...state, editId: "", editText: "" })
        }
        catch (err) {
            debugger;
        }

    }

    const del = async () => {
        try {
            //await deleteExample({ id: state.editId });
        }
        catch (err) {
            debugger;
        }

    }

    return (<div>
        <input value={state.name} onChange={(e) => setState({ ...state, name: e.target.value })} />
        <button onClick={() => { add() }}> add me</button>
        {mylist.map(p => <div key={p.articleId} onClick={() => setState({ ...state, editId: p.articleId, editText: p.Name })}>
            <span className=" text-xs mr-4">{p.articleId}</span>
            {state.editId == p.articleId ?
                <>
                    <input value={state.editText} onChange={(e) => setState({ ...state, editText: e.target.value })} />
                    <button className="m-2" onClick={() => { save() }}> save</button>
                    <button onClick={() => { del() }}> del</button>
                </> :
                <span className=" text-xl">{p.Name}</span>

            }

        </div>)}
    </div>)
}