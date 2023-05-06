import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { MongooseModule } from '@nestjs/mongoose';
import { AppResolver } from './app.resolver';
import { ExampleModule } from './example/example.module';
import * as dotenv from 'dotenv';
dotenv.config();

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      installSubscriptionHandlers: true,
      autoSchemaFile: true,
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
