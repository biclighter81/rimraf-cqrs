import { IAggregatRepository } from "rimraf-cqrs-lib";
import { Article, ArticleEvents } from "types";

export interface GraphQlContext {

    articleRepository: IAggregatRepository<ArticleEvents, Article>
}
