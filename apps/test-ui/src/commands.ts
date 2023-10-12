
  import { request } from 'graphql-request';

  export interface CommandResponse{
	errorMessage?: string;
	id?: string;
	name: string
}
interface ExampleCreatedInput{
	name: string
}
interface ExampleDeleted{
	id: string
}
interface ExampleTextChangedInput{
	id: string;
	text: string
}
export const createExample = (payload: ExampleCreatedInput) => {
            const document = `
        mutation ($payload: ExampleCreatedInput!) {
          createExample(payload:$payload) {
              id
              errorMessage
            }
          }          
        `
        return request<{ createExample: CommandResponse }>('http://localhost:3002/graphql', document, { payload }).then(p => {
            const response = p.createExample;
            if (response.errorMessage)
                throw response.errorMessage
            return response.id
        }).catch(err => {
            if (err instanceof Error)
                console.error(err);
            else
                throw err;
            return ""
        })
          }
export const deleteExample = (payload: ExampleDeleted) => {
            const document = `
        mutation ($payload: ExampleDeleted!) {
          deleteExample(payload:$payload) {
              id
              errorMessage
            }
          }          
        `
        return request<{ deleteExample: CommandResponse }>('http://localhost:3002/graphql', document, { payload }).then(p => {
            const response = p.deleteExample;
            if (response.errorMessage)
                throw response.errorMessage
            return response.id
        }).catch(err => {
            if (err instanceof Error)
                console.error(err);
            else
                throw err;
            return ""
        })
          }
export const setExampleText = (payload: ExampleTextChangedInput) => {
            const document = `
        mutation ($payload: ExampleTextChangedInput!) {
          setExampleText(payload:$payload) {
              id
              errorMessage
            }
          }          
        `
        return request<{ setExampleText: CommandResponse }>('http://localhost:3002/graphql', document, { payload }).then(p => {
            const response = p.setExampleText;
            if (response.errorMessage)
                throw response.errorMessage
            return response.id
        }).catch(err => {
            if (err instanceof Error)
                console.error(err);
            else
                throw err;
            return ""
        })
          }
  