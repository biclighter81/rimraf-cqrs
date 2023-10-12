import { Reducer } from "rimraf-cqrs-lib";
import { ExampleEvents } from "types";

export interface MyListDto {
    ExampleId: string;
    name: string;
}
export const exampleReducer: Reducer<ExampleEvents, MyListDto[]> = {
    ExampleCreated: (payload, state) => {
        return [...state, { ExampleId: payload.id, name: payload.name }];
    },
    ExampleDeleted: (payload, state) => {
        return state.filter((s) => s.ExampleId != payload.id);
    },
    ExampleTextChanged: (payload, state) => {
        return state.map(p => (p.ExampleId == payload.id ? { ...p, name: payload.text } : p));
    },
};