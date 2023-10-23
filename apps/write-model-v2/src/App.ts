import { Injectable, Module, OnApplicationBootstrap, OnApplicationShutdown } from "@nestjs/common";

import { ApolloServer } from '@apollo/server';
import { readFileSync } from 'fs';
import { GraphQlContext, getContext } from "./Graphql.context";
import { getDao } from "./dao";
import { getResolvers } from "./Graphql.resolvers";
import { getApolloServer } from "rimraf-cqrs-lib";

const typeDefs = readFileSync('./node_modules/types/commands.graphql', { encoding: 'utf-8' });

const resolvers = getResolvers();
const apolloServer = getApolloServer({ typeDefs, resolvers });
const dao = getDao();

@Injectable()
export class AppService implements OnApplicationBootstrap, OnApplicationShutdown {

    constructor() {
}

    async onApplicationBootstrap() {
        const context = getContext(await dao);
        await apolloServer.start(context)

        // // The ApolloServer constructor requires two parameters: your schema
        // // definition and your set of resolvers.
        // this.apolloServer = new ApolloServer<GraphQlContext>({
        //     typeDefs,
        //     resolvers,
        // });

        // // Passing an ApolloServer instance to the `startStandaloneServer` function:
        // //  1. creates an Express app
        // //  2. installs your ApolloServer instance as middleware
        // //  3. prepares your app to handle incoming requests
        // const { url } = await startStandaloneServer(this.apolloServer, {
        //     listen: { port: 4000 },
        //     context: async ({ req, res }) => getContext(await getDao())(req, res)
        // });



        return Promise.resolve();
    }

    onApplicationShutdown() {
        apolloServer.stop();
        dao.then(p => p.close());
    }

}

@Module({

    providers: [AppService],
})
export class AppModule { }
