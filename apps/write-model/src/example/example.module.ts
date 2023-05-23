import { Module } from '@nestjs/common';
import { ExampleCommands } from './example.command';
import { AppService } from '../app.service';

@Module({
  imports: [],
  providers: [AppService, ExampleCommands],
})
export class ExampleModule { }
