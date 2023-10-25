
import { IncomingMessage, ServerResponse } from "http";
import { IDao, databaseRepository } from "rimraf-cqrs-lib";
import { articleReducer } from "./Aggregates/article";
import { AppEventBus } from "types";

export const getContext = (dao: IDao) => {
    const db = databaseRepository<AppEventBus>(dao)
    return (req: IncomingMessage, res: ServerResponse) => {
        return {
            //articleRepository: new DatabaseRepository(articleReducer, "Article", ({ articleId }) => articleId, dao)
            articleRepository: db("Article", articleReducer, ({ articleId }) => articleId)
        }
    }
}


export type GraphQlContext = ReturnType<ReturnType<typeof getContext>>;
