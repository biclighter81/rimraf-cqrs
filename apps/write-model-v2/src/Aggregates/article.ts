import { Article, ArticleEvents } from "types";
import { ArticleCommandsResolvers } from "../generated/graphql"
import { randomUUID } from 'crypto';
import { Reducer } from "rimraf-cqrs-lib";
export const ArticleCommands: ArticleCommandsResolvers = {
    articleReadyForSale: async (_, param, context) => {

        return { id: "from articleOps res", errorMessage: "ddd" }
    },
    buildArticle: async (_, { payload }, context) => {
        if (payload.name == 'sven')
            return { id: "", errorMessage: "no sven allowed" }

        if (payload.name == 'moritz')
            return { id: "", errorMessage: "no moritz allowed" }


        const articleId = randomUUID();
        
        

        await context.articleRepository.save("ArticledBuilded", { articleId, name: payload.name });

        return { id: articleId }
    }
}


export const articleReducer: Reducer<ArticleEvents, Article> = {
    "ArticledBuilded": (event, state) => {
        return { ...state, name: event.name, articleId: event.articleId }
    }
}
