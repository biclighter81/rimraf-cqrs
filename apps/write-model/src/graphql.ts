
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export interface BuildArticle {
    articleId: string;
    name: string;
}

export interface ArticleReadyForSale {
    articleId: string;
    price: number;
}

export interface CommandResponse {
    id: string;
    name?: Nullable<string>;
    errorMessage?: Nullable<string>;
}

export interface IMutation {
    buildArticle(payload: BuildArticle): CommandResponse | Promise<CommandResponse>;
    articleReadyForSale(payload: ArticleReadyForSale): CommandResponse | Promise<CommandResponse>;
}

type Nullable<T> = T | null;
