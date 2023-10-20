import { getMutation } from "rimraf-cqrs-lib"
import { ArticleCommands } from "./Aggregates/article"
import { MutationResolvers, Resolvers } from "./generated/graphql"

export const getResolvers = async () => {
    const resolvers: Resolvers = {
        Query: {
            healthCheck: () => "Ok"
        },
        Mutation: getMutation<MutationResolvers>,
        ArticleCommands: ArticleCommands
    }
    return resolvers;
}