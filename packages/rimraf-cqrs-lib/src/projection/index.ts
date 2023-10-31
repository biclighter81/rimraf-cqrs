export * from "./ProjectionMediator";
export * from "./CommonMongoProjection";
export * from "./ProjectionServer";

import { ProjectionHandler } from "../types";

export interface Projection<TAppEventBus> {
    listName: string;
    aggHandler: ProjectionHandler<TAppEventBus, Promise<void>>;

    getState?: () => Promise<unknown>;
}



