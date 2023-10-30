export * from "./ProjectionMediator";
export * from "./CommonMongoProjection";

import { ProjectionHandler } from "../types";

export interface Projection<TAppEventBus> {
    listName: string;
    aggHandler: ProjectionHandler<TAppEventBus, Promise<void>>;

    getState?: () => Promise<unknown>;
}


export interface IProjectionMediator<TAppEventBus> {
    register(projection: Projection<TAppEventBus>): void;

    start(): Promise<void>;

}

