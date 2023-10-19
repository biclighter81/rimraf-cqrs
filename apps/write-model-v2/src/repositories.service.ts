
import { articleReducer } from "./Aggregates/article";
import { Injectable } from "@nestjs/common";
import { Connection } from "mongoose";
import { InjectConnection } from '@nestjs/mongoose';
import { LoggerDao, MongoDao, DatabaseRepository } from "rimraf-cqrs-lib";



@Injectable()
export class RepositoriesService {

    private dao = new LoggerDao(new MongoDao(this.connection));

    constructor(
        @InjectConnection()
        private readonly connection: Connection
    ) { }

    articleRepository = new DatabaseRepository(articleReducer, "Article", ({ articleId }) => articleId, this.dao);
}
