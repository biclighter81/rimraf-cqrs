import { Db, ObjectId, Document } from "mongodb";
import { Projection } from ".";
import { Reducer, IEventHandler, ProjectionHandler } from "../types";

export class CommonMongoProjection<TAppEventBus> implements Projection<TAppEventBus>{

    constructor(public listName: string, private database: Db) {
    }

    public addReducer<P extends keyof TAppEventBus, TDto extends Document>(
        aggName: P,
        aggReducer: Reducer<TAppEventBus[P], TDto[]>,
        dtoField: keyof (TDto extends (infer U)[] ? U : TDto)
    ) {
        const aggHandler: IEventHandler<TAppEventBus[P], Promise<void>> = async (event) => {

            const collection = this.database.collection<TDto>(this.listName);

            const currentStateList = (await collection.find({ [dtoField]: event.aggId } as any).toArray()) as TDto[];
            const reducer = aggReducer[event.eventName];
            if (reducer !== undefined) {
                const newStateList = reducer(event.payload, currentStateList || []);

                for (const newState of newStateList) {
                    if (newState._id === undefined)
                        await collection.insertOne(newState as any);
                    else {
                        const oldItem = currentStateList.find(p => p._id == newState._id)
                        if (oldItem === undefined)
                            throw "geht nicht";
                        else {
                            if (oldItem !== newState)
                                await collection.updateOne({ _id: new ObjectId(newState._id) } as any, { $set: newState } as any)
                        }
                    }
                }

                for (const existingItem of currentStateList) {
                    const oldItem = newStateList.find(p => p._id == existingItem._id);
                    if (oldItem === undefined)
                        await collection.deleteOne({ _id: new ObjectId(existingItem._id) } as any)
                }
            }
            return Promise.resolve()
        }
        this.aggHandler[aggName] = aggHandler;
        return this;
    }

    aggHandler: ProjectionHandler<TAppEventBus, Promise<void>> = {};
    getState = () => {
        const collection = this.database.collection(this.listName);
        return collection.find().toArray()
    };

}

export const propjectionFactory = <TAppEventBus>(db: Db) => {
    return (listName: string) => {
        const projection = new CommonMongoProjection<TAppEventBus>(listName, db)
        return projection.addReducer.bind(projection);
    }
}
