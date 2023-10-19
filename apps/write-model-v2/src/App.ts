import { Injectable, Logger, Module, OnApplicationBootstrap, OnApplicationShutdown } from "@nestjs/common";

import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { readFileSync } from 'fs';
import { MutationResolvers, Resolvers } from "./generated/graphql";
import { ArticleCommands } from "./Aggregates/article";
import { GraphQlContext } from "./Graphql.context";
import { IAggregatRepository } from "rimraf-cqrs-lib";
import { Article, ArticleEvents } from "types";
import { RepositoriesService } from "./repositories.service";
import * as dotenv from 'dotenv';
import { MongooseModule } from "@nestjs/mongoose";

const typeDefs = readFileSync('./node_modules/types/commands.graphql', { encoding: 'utf-8' });


dotenv.config();

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

const articleRepository: IAggregatRepository<ArticleEvents, Article> = {
    async getState(id) {
        return { articleId: id, name: "mock", price: 10 }
    },
    save(eventName, payload) {
        console.log("saving:", eventName, payload);
        return Promise.resolve();
    },
}

@Injectable()
export class AppService implements OnApplicationBootstrap, OnApplicationShutdown {

    constructor(private repositories: RepositoriesService) {
        
     }
    private logger: Logger = new Logger(AppService.name);
    private apolloServer?: ApolloServer<GraphQlContext>=undefined;
    async onApplicationBootstrap() {
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
            context: async ({ req, res }) => {
                return {
                    articleRepository:this.repositories.articleRepository
                }
            }
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
    imports: [
        MongooseModule.forRoot(process.env.MONGODB_URL as string, {
            dbName: process.env.MONGODB_DB,
        })
    ],
    providers: [AppService, RepositoriesService],
})
export class AppModule { }
