import { Field, InputType } from "@nestjs/graphql";
import { Reducer } from "../lib/types";

export interface Example {
    id: string;
    name: string;
    shippingAddress: string;
    billingAddress: string;
}


export interface ExampleCreated {
    name: string;
}

export interface ExampleTextChanged {
    text: string;
}

export interface ExampleEvents {
    ExampleCreated: ExampleCreated;
    ExampleTextChanged: ExampleTextChanged;
}

export const exampleReducer: Reducer<ExampleEvents, Example> = {
    ExampleCreated: (payload, state) => {
        return { ...state, name: payload.name };
    },
    ExampleTextChanged: (payload, state) => {
        return { ...state, text: payload.text };
    }
}

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