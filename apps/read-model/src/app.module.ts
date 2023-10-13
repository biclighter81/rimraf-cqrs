import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AppResolver } from './app.resolver';
import * as dotenv from 'dotenv';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLError } from 'graphql';
import { ListModule } from './list.module';

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
    ListModule
  ],
  controllers: [],
  providers: [AppService, AppResolver],
})
export class AppModule {}
