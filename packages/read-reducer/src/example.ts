import { Example, ExampleEvents, Reducer } from "types";

export const exampleReducer: Reducer<ExampleEvents, Example> = {
  ExampleCreated: (payload, state) => {
    return { ...state, name: payload.name };
  },
  ExampleTextChanged: (payload, state) => {
    return { ...state, text: payload.text };
  },
};
