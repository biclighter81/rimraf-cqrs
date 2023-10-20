
import { IncomingMessage, ServerResponse } from "http";
import { IDao, DatabaseRepository } from "rimraf-cqrs-lib";
import { articleReducer } from "./Aggregates/article";

export const getContext = (dao: IDao) => {
    return (req: IncomingMessage, res: ServerResponse) => {

        return {
            articleRepository: new DatabaseRepository(articleReducer, "Article", ({ articleId }) => articleId, dao)
        }

        
    }
}


export type GraphQlContext = ReturnType<ReturnType<typeof getContext>>;
