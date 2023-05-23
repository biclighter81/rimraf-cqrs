import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { ExampleNotFoundError } from './example.errors';

import {
  ExampleCreatedInput,
  ExampleTextChangedInput,
  exampleReducer,
} from './example';
import { CommandResponse } from '../lib/types';
import { ExampleEvents, Example } from 'types';
import { GraphQLError } from 'graphql';
import { IAggregatRepository } from 'rimraf-cqrs-lib';
import { AppService } from '../app.service';
@Resolver()
export class ExampleCommands {
  constructor(private readonly writeSrv: AppService) { }

  @Mutation((returns) => CommandResponse)
  async createExample(
    @Args('payload') payload: ExampleCreatedInput,
  ): Promise<CommandResponse> {
    try {
      /* const id = await this.writeSrv.save<ExampleEvents>(
        'Example',
        'ExampleCreated',
      )({
        name: payload.name,
      }); */
      
      const id = await this.writeSrv.Example.save('ExampleCreated')({
        name: payload.name,
      });
      return {
        name: 'CreateExample',
        id,
      };
    } catch (e) {
      console.log(e);
      throw new GraphQLError('Error creating ExampleEvent');
    }
  }

  @Mutation((returns) => CommandResponse)
  async setExampleText(
    @Args('payload') payload: ExampleTextChangedInput,
  ): Promise<CommandResponse> {
    try {
      /* const state = await this.writeSrv.getState<ExampleEvents, Example>(
        'Example',
        payload.id,
        exampleReducer,
      ); */
      const state = await this.writeSrv.Example.getState(payload.id);
      if (!state) throw new ExampleNotFoundError(payload.id);
      await this.writeSrv.Example.save('ExampleTextChanged')({
        ...payload,
      });
      return {
        name: 'SetExampleText',
        id: payload.id,
      };
    } catch (e) {
      if (e instanceof ExampleNotFoundError) {
        throw new GraphQLError('Example not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      console.log(e);
      throw new GraphQLError('Error setting Example text');
    }
  }
}
