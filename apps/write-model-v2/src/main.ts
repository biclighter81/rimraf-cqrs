
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./App";
import * as dotenv from 'dotenv';

//dotenv.config();

(async () => {
    const app = await NestFactory.createApplicationContext(AppModule);
    app.enableShutdownHooks()
})().catch(e => {
    console.error(e)
});