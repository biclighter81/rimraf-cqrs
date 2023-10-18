import { ArticleCommandsResolvers } from "./generated/graphql"

export const ArticleCommands: ArticleCommandsResolvers = {
    articleReadyForSale: async (_, param, context) => {

        return { id: "from articleOps res", name: "namess" + param.payload.articleId, errorMessage: "ddd" }
    },
    buildArticle: async (_, { payload }) => {
        if (payload.name == 'sven')
            return { id: "",name:"", errorMessage: "ddd" }
        return { id: "from articleOps res", name: "namess", errorMessage: "ddd" }
    }
}

