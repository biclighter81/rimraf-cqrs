import { ArticleCommandsResolvers } from "./generated/graphql"

export const ArticleCommands: ArticleCommandsResolvers = {
    articleReadyForSale: async (_, param, context) => {

        return { id: "from articleOps res", name: "namess" + param.payload.articleId, errorMessage: "ddd" }
    },
    buildArticles: async (_, { payload }) => {
        if (payload.name == 'sven')
            return { id: "", errorMessage: "ddd" }
        return { id: "from articleOps res", name: "namess", errorMessage: "ddd" }
    }
}

