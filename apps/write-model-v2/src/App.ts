import { Injectable, Logger, Module, OnApplicationBootstrap, OnApplicationShutdown } from "@nestjs/common";

import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { readFileSync } from 'fs';
import { GraphQlContext, getContext } from "./Graphql.context";
import { getDao } from "./dao";
import { getResolvers } from "./Graphql.resolvers";

const typeDefs = readFileSync('./node_modules/types/commands.graphql', { encoding: 'utf-8' });



@Injectable()
export class AppService implements OnApplicationBootstrap, OnApplicationShutdown {

    constructor() { }

    private logger: Logger = new Logger(AppService.name);
    private apolloServer?: ApolloServer<GraphQlContext> = undefined;
    async onApplicationBootstrap() {
        const resolvers = await getResolvers();

        this.logger.log("Starting...");
        // The ApolloServer constructor requires two parameters: your schema
        // definition and your set of resolvers.
        this.apolloServer = new ApolloServer<GraphQlContext>({
            typeDefs,
            resolvers,
        });

        // Passing an ApolloServer instance to the `startStandaloneServer` function:
        //  1. creates an Express app
        //  2. installs your ApolloServer instance as middleware
        //  3. prepares your app to handle incoming requests
        const { url } = await startStandaloneServer(this.apolloServer, {
            listen: { port: 4000 },
            context: async ({ req, res }) => getContext(await getDao())(req, res)
        });

        this.logger.log(`🚀  Server ready at: ${url}`);

        return Promise.resolve();
    }

    onApplicationShutdown() {
        this.logger.log("Ending...");
        this.apolloServer?.stop();
    }

}

@Module({

    providers: [],
})
export class AppModule { }
