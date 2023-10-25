
import { readFileSync } from 'fs';
import { getContext } from "./Graphql.context";
import { getDao } from "./dao";
import { getResolvers } from "./Graphql.resolvers";
import { getApolloServer } from "rimraf-cqrs-lib";

const typeDefs = readFileSync('./node_modules/types/commands.graphql', { encoding: 'utf-8' });

const resolvers = getResolvers();
const apolloServer = getApolloServer({ typeDefs, resolvers });

export const app = async () => {
    const dao = await getDao();

    const context = getContext(dao);
    await apolloServer.start(context)

    return async () => {
        apolloServer.stop();
        await dao.close();
    };
}
