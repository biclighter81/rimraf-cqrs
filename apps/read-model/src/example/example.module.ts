import { Module } from '@nestjs/common';
import { ExampleResolver } from './example.resolver';
import { MqttModule } from '../mqtt/mqtt.module';

@Module({
  imports: [MqttModule],
  providers: [ExampleResolver],
})
export class ExampleModule {}
