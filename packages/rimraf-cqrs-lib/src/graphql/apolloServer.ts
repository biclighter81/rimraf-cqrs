import { ApolloServer, ApolloServerOptions, BaseContext, ContextFunction } from "@apollo/server";
import { StandaloneServerContextFunctionArgument, startStandaloneServer } from '@apollo/server/standalone';
import Debug from "debug";
import { IncomingMessage, ServerResponse } from "http";

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            PORT: number
        }
    }
}
export const getApolloServer = <TContext extends BaseContext>(config: ApolloServerOptions<TContext>) => {
    const logger = Debug("ApolloServer");
    
    logger("create server 🔥");
    const apolloServer = new ApolloServer<TContext>(config);
    logger("server created 🔞");
    return {
        start: async (context: (req: IncomingMessage, res: ServerResponse) => TContext) => {

            logger("starting... 🙌");
            const { url } = await startStandaloneServer(apolloServer, {
                listen: { port: process.env.PORT || 4000 },
                context: async ({ req, res }) => context(req, res)
            });
            logger(`🚀  Server ready at: ${url} 👌`);
        },
        stop: () => {
            logger("stoping... 🤔");
            apolloServer.stop();
        }
    }
}