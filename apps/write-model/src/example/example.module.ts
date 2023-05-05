import { Module } from "@nestjs/common";
import { ExampleCommands } from "./example.command";
import { AppService } from "../app.service";
import { ClientsModule, Transport } from "@nestjs/microservices";

@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'EXAMPLE_SERVICE',
                transport: Transport.RMQ,
                options: {
                    urls: [process.env.RABBITMQ_URL],
                }
            }
        ])
    ],
    providers: [
        AppService,
        ExampleCommands,
    ],
})
export class ExampleModule { }