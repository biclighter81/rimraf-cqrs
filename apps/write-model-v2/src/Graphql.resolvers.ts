import { getMutation } from "rimraf-cqrs-lib"
import { ArticleCommands } from "./Aggregates/article"
import { MutationResolvers, Resolvers } from "./generated/graphql"
import { ManufacturerCommands } from "./Aggregates/manufactor";

const mutationResolvers: MutationResolvers = {
    articlePriceIncreased: async (_, param, context) => {
        const article = await context.articleRepository.getState(param.payload.articleId);
        if (article !== undefined) {
            await context.articleRepository.save("PriceIncreased", { articleId: article.articleId, newPrice: param.payload.price });
            return { id: article.articleId };
        }
        return { id: "", errorMessage: "not found" }
    }
}
export const getResolvers = () => {
    const resolvers: Resolvers = {
        Query: {
            healthCheck: () => "Ok"
        },
        Mutation: getMutation<MutationResolvers>(mutationResolvers),
        ArticleCommands: ArticleCommands,
        ManufacturerCommands: ManufacturerCommands
    }
    return resolvers;
}