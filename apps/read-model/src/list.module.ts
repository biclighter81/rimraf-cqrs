import { Module } from '@nestjs/common';
import { ListResolver } from './list.resolver';

@Module({
    providers: [ListResolver],
})
export class ListModule { }
