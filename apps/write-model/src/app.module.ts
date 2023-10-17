import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { MongooseModule } from '@nestjs/mongoose';
import { ExampleModule } from './example/example.module';
import * as dotenv from 'dotenv';
import { GraphQLError } from 'graphql';
import { join } from 'path';
dotenv.config();

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,      
      typePaths: ['./node_modules/types/**/*.graphql'],
      formatError: (error: GraphQLError) => {
        const graphQLFormattedError = {
          message: error.message,
          code: error.extensions.code,
        };
        return graphQLFormattedError;
      },
    }),
    MongooseModule.forRoot(process.env.MONGODB_URL as string, {
      dbName: process.env.MONGODB_DB,
    }),
    //ExampleModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule { }
