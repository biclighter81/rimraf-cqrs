import { Module } from '@nestjs/common';
import { ExampleCommands } from './example.command';
import { AppService } from '../app.service';
import { MqttModule } from '../mqtt/mqtt.module';

@Module({
  imports: [MqttModule],
  providers: [AppService, ExampleCommands],
})
export class ExampleModule {}
