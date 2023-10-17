
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export class BuildArticle {
    articleId: string;
    name: string;
}

export class ArticleReadyForSale {
    articleId: string;
    price: number;
}

export class CommandResponse {
    id: string;
    name?: Nullable<string>;
    errorMessage?: Nullable<string>;
}

export abstract class IMutation {
    abstract buildArticle(payload: BuildArticle): CommandResponse | Promise<CommandResponse>;

    abstract articleReadyForSale(payload: ArticleReadyForSale): CommandResponse | Promise<CommandResponse>;
}

type Nullable<T> = T | null;
