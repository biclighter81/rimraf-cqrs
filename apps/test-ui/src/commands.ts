
  import { request } from 'graphql-request';

  interface ArticleReadyForSale{
	articleId: string;
	price: number
}
interface BuildArticle{
	articleId: string;
	name: string
}
export interface CommandResponse{
	errorMessage?: string;
	id: string;
	name?: string
}
export const articleReadyForSale = (payload: ArticleReadyForSale) => {
            const document = `
        mutation ($payload: ArticleReadyForSale!) {
          articleReadyForSale(payload:$payload) {
              id
              errorMessage
            }
          }          
        `
        return request<{ articleReadyForSale: CommandResponse }>('http://localhost:3002/graphql', document, { payload }).then(p => {
            const response = p.articleReadyForSale;
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
export const buildArticle = (payload: BuildArticle) => {
            const document = `
        mutation ($payload: BuildArticle!) {
          buildArticle(payload:$payload) {
              id
              errorMessage
            }
          }          
        `
        return request<{ buildArticle: CommandResponse }>('http://localhost:3002/graphql', document, { payload }).then(p => {
            const response = p.buildArticle;
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
  