import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AppResolver } from './app.resolver';
import * as dotenv from 'dotenv';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { MongooseModule } from '@nestjs/mongoose';
import { ExampleModule } from './example/example.module';
import { GraphQLError, GraphQLFormattedError } from 'graphql';
dotenv.config();

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      installSubscriptionHandlers: true,
      autoSchemaFile: true,
      formatError: (error: GraphQLError) => {
        const graphQLFormattedError = {
          message: error.message,
          code: error.extensions.code,
        };
        return graphQLFormattedError;
      },
    }),
    MongooseModule.forRoot(process.env.MONGODB_URL, {
      dbName: process.env.MONGODB_DB,
    }),
    ExampleModule,
  ],
  controllers: [],
  providers: [AppService, AppResolver],
})
export class AppModule {}
