import { Reducer } from "rimraf-cqrs-lib";
import { ArticleEvents } from "types";

export interface ArticleOverview {
    articleId: string,
    Name: string,
    Price: number,

    InSale: boolean,
    manufacturId?: string
    manufacturerName?: string;
}

export const articleOverviewReducer: Reducer<ArticleEvents, ArticleOverview[]> = {
    "ArticledBuilded": (event, state) =>
        ([...state, { articleId: event.articleId, Name: event.name, Price: 0, InSale: false }]),
    "ReadyForSale": (event, state) =>
        (state.map(p => p.articleId == event.articleId ? ({ ...p, Price: event.price, InSale: true }) : p)),
    "PriceIncreased": (event, state) =>
        (state.map(p => p.articleId == event.articleId ? ({ ...p, Price: event.newPrice }) : p)),
    "OutOfOrder": (event, state) =>
        (state.map(p => p.articleId == event.articleId ? ({ ...p, InSale: false }) : p)),
    "NameChanged": (event, state) =>
        (state.map(p => p.articleId == event.articleId ? ({ ...p, Name: event.name }) : p)),
    "ManufacturerAssigned": (event, state) => {
       return (state.map(p => p.articleId == event.articleId ? ({ ...p, manufacturId: event.manufactor.manufactorId, manufacturerName: event.manufactor.name }) : p));
    }
};