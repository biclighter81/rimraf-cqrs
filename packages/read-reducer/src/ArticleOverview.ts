import { Reducer } from "rimraf-cqrs-lib";
import { ArticleEvents } from "types";

export interface ArticleOverview {
    articleId: string,
    Name: string,
    Price: number
}

export const articleOverviewReducer: Reducer<ArticleEvents, ArticleOverview[]> = {
    "ArticledBuilded": (event, state) => {
        return [...state, { articleId: event.articleId, Name: event.name, Price: 0 }]
    }
};