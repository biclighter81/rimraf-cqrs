import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { ExampleNotFoundError } from './example.errors';

import {
  ExampleCreatedInput,
  ExampleDeleted,
  ExampleTextChangedInput,
} from './example';
import { CommandResponse } from '../lib/types';
import { GraphQLError } from 'graphql';
import { AppService } from '../app.service';
import { randomUUID } from 'crypto';
@Resolver()
export class ExampleCommands {
  constructor(private readonly writeSrv: AppService) { }

  @Mutation((returns) => CommandResponse)
  async createExample(
    @Args('payload') payload: ExampleCreatedInput,
  ): Promise<CommandResponse> {
    try {
      if (payload.name == "moritz")
        return {
          name: "xy",
          errorMessage: 'no moritz'

        }

      if (payload.name == "sty")
        throw new GraphQLError('Error creating ExampleEvent, because sty');

      const id = randomUUID();

      await this.writeSrv.Example.save('ExampleCreated')({
        id: id,
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

      if (payload.text == "moritz")
        return {
          name: "SetExampleText",
          errorMessage: 'no moritz',
          id: payload.id,
        }
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

  @Mutation((returns) => CommandResponse)
  async deleteExample(
    @Args('payload') payload: ExampleDeleted,
  ): Promise<CommandResponse> {
    try {
      const state = await this.writeSrv.Example.getState(payload.id);
      if (!state) throw new ExampleNotFoundError(payload.id);
      await this.writeSrv.Example.save('ExampleDeleted')({
        ...payload,
      });
      return {
        name: 'ExampleDeleted',
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
