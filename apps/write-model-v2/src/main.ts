
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./App";

(async () => {
    const app = await NestFactory.createApplicationContext(AppModule);
    app.enableShutdownHooks()
})().catch(e => {
    console.error(e)
});