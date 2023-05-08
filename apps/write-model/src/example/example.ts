import { Field, InputType } from '@nestjs/graphql';
import { ExampleEvents, Example, Reducer } from 'types';

export const exampleReducer: Reducer<ExampleEvents, Example> = {
  ExampleCreated: (payload, state) => {
    return { ...state, name: payload.name };
  },
  ExampleTextChanged: (payload, state) => {
    return { ...state, text: payload.text };
  },
};

//gql

@InputType()
export class ExampleCreatedInput {
  @Field()
  name: string;
}

@InputType()
export class ExampleTextChangedInput {
  @Field()
  text: string;
  @Field()
  id: string;
}
