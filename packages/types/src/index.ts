import { ArticleEvents, ManufactorEvents, OrderEvents } from "./Entities";

export * from "./Entities";

export interface AppEventBus {
    "Article": ArticleEvents;
    "Order": OrderEvents;
    "Manufacturer": ManufactorEvents
}