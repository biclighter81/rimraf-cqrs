import { Injectable, Logger, Module, OnApplicationBootstrap, OnApplicationShutdown, Provider } from "@nestjs/common";

import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { readFileSync } from 'fs';
import { MutationResolvers, Resolvers } from "./generated/graphql";
import { ArticleCommands } from "./article.commands";

const typeDefs = readFileSync('./node_modules/types/commands.graphql', { encoding: 'utf-8' });


const mutation = new Proxy<MutationResolvers>({} as MutationResolvers, {
    get: (target, prop, rec) => prop == "__isTypeOf" ? undefined : () => () => { }
});

export const resolvers: Resolvers = {
    Query: {
        healthCheck: () => "Ok"
    },
    Mutation: mutation,    
    ArticleCommands: ArticleCommands
}


@Injectable()
export class AppService implements OnApplicationBootstrap, OnApplicationShutdown {

    private logger: Logger = new Logger(AppService.name);
    private apolloServer: ApolloServer<any>;
    async onApplicationBootstrap() {
        this.logger.log("Starting...");
        // The ApolloServer constructor requires two parameters: your schema
        // definition and your set of resolvers.
        this.apolloServer = new ApolloServer({
            typeDefs,
            resolvers,
        });

        // Passing an ApolloServer instance to the `startStandaloneServer` function:
        //  1. creates an Express app
        //  2. installs your ApolloServer instance as middleware
        //  3. prepares your app to handle incoming requests
        const { url } = await startStandaloneServer(this.apolloServer, {
            listen: { port: 4000 },
        });

        this.logger.log(`🚀  Server ready at: ${url}`);

        return Promise.resolve();
    }

    onApplicationShutdown() {
        this.logger.log("Ending...");
        this.apolloServer.stop();
    }

}

@Module({
    providers: [AppService],
})
export class AppModule { }
