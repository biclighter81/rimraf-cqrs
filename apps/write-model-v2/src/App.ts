import { Injectable, Module, OnApplicationBootstrap, OnApplicationShutdown } from "@nestjs/common";

import { readFileSync } from 'fs';
import { getContext } from "./Graphql.context";
import { getDao } from "./dao";
import { getResolvers } from "./Graphql.resolvers";
import { getApolloServer } from "rimraf-cqrs-lib";

const typeDefs = readFileSync('./node_modules/types/commands.graphql', { encoding: 'utf-8' });

const resolvers = getResolvers();
const apolloServer = getApolloServer({ typeDefs, resolvers });


export const app=async()=>{
        const dao = await getDao();

        const context = getContext( dao);
        await apolloServer.start(context)

        return async()=>{
            apolloServer.stop();
            await dao.close();
        };
}

// @Injectable()
// export class AppService implements OnApplicationBootstrap, OnApplicationShutdown {

//     constructor() {
// }

//     async onApplicationBootstrap() {
//         const context = getContext(await dao);
//         await apolloServer.start(context)
        
//         return Promise.resolve();
//     }

//     onApplicationShutdown() {
//         apolloServer.stop();
//         dao.then(p => p.close());
//     }

// }

// @Module({

//     providers: [AppService],
// })
// export class AppModule { }
