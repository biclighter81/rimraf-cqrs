import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { CommandResponse } from "../lib/command-res.model";
import { ExampleNotFoundError } from "./example.errors";
import { AppService } from "../app.service";
import { Example, ExampleCreatedInput, ExampleEvents, ExampleTextChangedInput, exampleReducer } from "./example";

@Resolver()
export class ExampleCommands {

    constructor(private readonly writeSrv: AppService) { }

    @Mutation(returns => CommandResponse)
    async createExample(
        @Args('payload') payload: ExampleCreatedInput
    ): Promise<CommandResponse> {
        try {
            const id = await this.writeSrv.save<ExampleEvents>('Example', 'ExampleCreated')({
                name: 'test'
            })
            return {
                name: "CreateExample",
                statusCode: 200,
                id
            }
        } catch (e) {
            console.log(e)
            return {
                name: "CreateExample",
                errorMessage: 'Error creating ExampleEvent',
                statusCode: 500,
            }
        }
    }

    @Mutation(returns => CommandResponse)
    async setExampleText(
        @Args('payload') payload: ExampleTextChangedInput
    ): Promise<CommandResponse> {
        let cres = {
            name: "SetExampleText"
        }
        try {
            const state = await this.writeSrv.getState<ExampleEvents, Example>('Example', payload.id, exampleReducer);
            if (!state) throw new ExampleNotFoundError(payload.id);
            await this.writeSrv.save<ExampleEvents>('Example', 'ExampleTextChanged')({
                ...payload
            })
        } catch (e) {
            if (e instanceof ExampleNotFoundError) {
                return {
                    ...cres,
                    errorMessage: e.message,
                    statusCode: 404,
                }
            }
            console.log(e)
            return {
                ...cres,
                errorMessage: 'Error creating ExampleEvent',
                statusCode: 500,
            }
        }
    }

}