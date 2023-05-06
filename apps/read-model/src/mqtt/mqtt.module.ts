import { Module } from '@nestjs/common';
import { MqttService } from './mqtt.service';

@Module({
  imports: [],
  providers: [MqttService],
  exports: [MqttService],
})
export class MqttModule {}
