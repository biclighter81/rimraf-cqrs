import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AppResolver } from './app.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { ExampleModule } from './example/example.module';
import * as dotenv from 'dotenv';
dotenv.config();

@Module({
  imports: [GraphQLModule.forRoot<ApolloDriverConfig>({
    driver: ApolloDriver,
    installSubscriptionHandlers: true,
    autoSchemaFile: true,
  }),
  MongooseModule.forRoot(process.env.MONGODB_URL, {
    dbName: process.env.MONGODB_DB,
  }),
    ExampleModule
  ],
  controllers: [AppController],
  providers: [AppService, AppResolver],
})
export class AppModule { }
