'use client'

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
export default function ListConsole({ listName }: { listName: string }) {
    const [events, setEvents] = useState<{ eventName: string, payload: any, key: number }[]>([])

    useEffect(() => {
        const socket = io("http://localhost:4000/" + listName);

        socket.on("event", (event) => {
            setEvents((prev) => [...prev, { eventName: event.eventName, payload: event.payload, key: new Date().getTime() }])
            console.log(event)
        })
        socket.on("initState", (event) => {
            setEvents((prev) => [...prev, { eventName: "initState", payload: event, key: new Date().getTime() }])
            console.log(event)
        })
        return () => {
            socket.close();
        }
    }, [])

    return <div>
        Events: {listName}
        {events.map(p => (
            <div key={p.key}>
                <span>{p.eventName}:</span><pre>{JSON.stringify(p.payload)}</pre>
            </div>
        ))}
       
    </div>
}