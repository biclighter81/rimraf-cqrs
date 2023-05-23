import { Example, ExampleEvents } from "types";
import { Reducer } from "rimraf-cqrs-lib";

export const exampleReducer: Reducer<ExampleEvents, Example> = {
  ExampleCreated: (payload, state) => {
    return { ...state, name: payload.name };
  },
  ExampleTextChanged: (payload, state) => {
    return { ...state, text: payload.text };
  },
};
