import { Args, Query, Resolver, Subscription } from '@nestjs/graphql';
import { ExampleListService } from './example.list';
import { ExampleCreated } from 'types';
import { ExampleListModel } from './example.schema';

@Resolver()
export class ExampleResolver {
  constructor(private readonly list: ExampleListService) {}

  @Subscription((returns) => ExampleListModel)
  exampleCreated() {
    return this.list.pubSub.asyncIterator<ExampleCreated>('ExampleCreated');
  }

  @Query((returns) => ExampleListModel)
  async example(@Args('id', { type: () => String }) id: string) {
    return await this.list.example(id);
  }
}
