import { EventHandlerFunc, Event } from "rimraf-cqrs-lib";

export interface QueueReducer { (event: Event<unknown>): Promise<void> };

export interface ReadModelList {
  ListName: string

  AggregateReducer(aggName: string): QueueReducer | undefined
}