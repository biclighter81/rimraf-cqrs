import { Reducer } from "rimraf-cqrs-lib";
import { ManufacturerCommandsResolvers } from "../generated/graphql";
import { Manufactor, ManufactorEvents } from "types";
import { randomUUID } from "crypto";
export const manufacturerReducer: Reducer<ManufactorEvents, Manufactor> = {
    "CreateManufactor": (event, state) =>
        ({ ...state, name: event.name, manufactorId: event.manufactorId }),
    "NameChanged": (event, state) =>
        ({ ...state, name: event.name, manufactorId: event.manufactorId }),
}
export const ManufacturerCommands: ManufacturerCommandsResolvers = {
    "createManufactor": async (_, param, context) => {
        const { name } = param;
        const manufactorId = randomUUID();

        debugger;
        await context.manufacturerRepository.save(
            "CreateManufactor",
            { manufactorId: manufactorId, name: name }
        );

        return { id: manufactorId }

    },
    "changeName": async (_, param, context) => {
        const { name, manufactorId } = param;

        await context.manufacturerRepository.save(
            "CreateManufactor",
            { manufactorId, name: name }
        );

        return { id: manufactorId }
    }
}