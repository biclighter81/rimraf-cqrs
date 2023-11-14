import { Article, ArticleEvents, Manufactor, ManufactorEvents } from "types";
import { ArticleCommandsResolvers } from "../generated/graphql"
import { randomUUID } from 'crypto';
import { Reducer } from "rimraf-cqrs-lib";
export const ArticleCommands: ArticleCommandsResolvers = {
    articleReadyForSale: async (_, param, context) => {
        const article = await context.articleRepository.getState(param.payload.articleId);

        if (article !== undefined) {

            await context.articleRepository.save(
                "ReadyForSale",
                { articleId: article.articleId, price: param.payload.price }
            );

            return { id: article.articleId }
        }
        return { "id": "", errorMessage: "article not exists" }
    },
    buildArticle: async (_, { payload }, context) => {
        if (payload.name == 'sven')
            return { id: "", errorMessage: "no sven allowed" }

        if (payload.name == 'moritz')
            return { id: "", errorMessage: "no moritz allowed" }


        const articleId = randomUUID();

        await context.articleRepository.save("ArticledBuilded", { articleId, name: payload.name });

        return { id: articleId }
    },
    "changePrice": async (_, param, context) => {
        const article = await context.articleRepository.getState(param.articleId);

        if (article !== undefined) {
            if (param.newPrice > article.price * 1.1)
                return { "id": article.articleId, errorMessage: "max 10% increase" }

            await context.articleRepository.save(
                "PriceIncreased",
                { articleId: article.articleId, newPrice: param.newPrice }
            );

            return { id: article.articleId }
        }
        return { "id": "", errorMessage: "article not exists" }
    },
    "disable": async (_, param, context) => {
        const article = await context.articleRepository.getState(param.articleId);

        if (article !== undefined) {
            if (!article.active)
                return { "id": article.articleId, errorMessage: "article not in sale" }

            await context.articleRepository.save(
                "OutOfOrder",
                { articleId: article.articleId }
            );

            return { id: article.articleId }
        }
        return { "id": "", errorMessage: "article not exists" }
    },
    "changeArticleName": async (_, param, context) => {
        const { id, name } = param.payload;
        try {
            if (name.length < 3) {
                throw new Error('Article length must be longer then 3');
            }
            const article = await context.articleRepository.getState(id);
            if (!article) {
                throw new Error('Article does not exist')
            }
            await context.articleRepository.save("NameChanged", {
                articleId: id,
                name
            });
            return { id }
        } catch (e) {
            if (e instanceof Error)
                return { "id": id, errorMessage: e.message }
            return { "id": id, errorMessage: "unknown Error" }
        }
    },
    "assignManufacturer": async (_, param, context) => {
        var { articleId, manufacturerId } = param;
        const article = await context.articleRepository.getState(articleId);
        const manufacturer = await context.manufacturerRepository.getState(manufacturerId);
        try {
            if (!article) {
                throw new Error('Article does not exist')
            }

            if (!manufacturer)
                throw new Error('Article does not exist')

            await context.articleRepository.save("ManufacturerAssigned", {
                articleId,
                manufactor: manufacturer
            });
            return { id: articleId }
        } catch (e) {
            if (e instanceof Error)
                return { "id": articleId, errorMessage: e.message }
            return { "id": articleId, errorMessage: "unknown Error" }
        }

    }
}


export const articleReducer: Reducer<ArticleEvents, Article> = {
    "ArticledBuilded": (event, state) =>
        ({ ...state, name: event.name, articleId: event.articleId, active: false }),
    "ReadyForSale": (event, state) =>
        ({ ...state, price: event.price, active: true }),
    "PriceIncreased": (event, state) =>
        ({ ...state, price: event.newPrice }),
    "OutOfOrder": (event, state) =>
        ({ ...state, active: false }),
    "ManufacturerAssigned": (event, state) =>
        ({ ...state, manufacturer: event.manufactor }),
}

