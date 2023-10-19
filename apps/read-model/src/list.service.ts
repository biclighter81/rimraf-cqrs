import { Inject, Injectable, Logger } from "@nestjs/common";

import { QueueReducer, ReadModelList } from "./ReadModel";

@Injectable()
export class ListService {
    constructor(
        @Inject('ReadModelList') private lists: ReadModelList[],
        @Inject('WorkQueue') private eventBus: { [aggName: string]: (handler: QueueReducer) => void },
    ) {
        for (const aggName in eventBus) {
            eventBus[aggName](event => {
                const listsHandler = lists
                    .filter(list => list.AggregateReducer(aggName) !== undefined)
                    .map(list => list.AggregateReducer(aggName)) as QueueReducer[];

                const ret = listsHandler.map(p => p(event));
                return Promise.all(ret).then(p => Promise.resolve());
            })
        }

    }

    private logger: Logger = new Logger(ListService.name);
}