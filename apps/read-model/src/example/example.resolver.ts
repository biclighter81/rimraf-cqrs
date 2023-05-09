import { Args, Query, Resolver, Subscription } from '@nestjs/graphql';
import { ExampleListService } from './example.list';
import { ExampleCreated } from 'types';
import { ExampleListModel } from './example.schema';
import { GraphQLError } from 'graphql';

@Resolver()
export class ExampleResolver {
  constructor(private readonly list: ExampleListService) {}

  @Subscription((returns) => ExampleListModel)
  exampleCreated() {
    return this.list.pubSub.asyncIterator<ExampleCreated>('ExampleCreated');
  }

  @Query((returns) => ExampleListModel)
  async example(@Args('id', { type: () => String }) id: string) {
    const example = await this.list.example(id);
    if (!example) {
      throw new GraphQLError('Example not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }
    return example;
  }
}
