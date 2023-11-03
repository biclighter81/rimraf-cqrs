
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */
  import { request } from 'graphql-request';
interface ArticleReadyForSale{
	articleId:string;
	price:number
}
interface BuildArticle{
	name:string
}
  export const article= {
      //ArticleCommands
      articleReadyForSale:(payload:ArticleReadyForSale)=>{
            const document = `
        mutation ($payload: ArticleReadyForSale!) {
          article{
    articleReadyForSale(payload:$payload) {
            id
            errorMessage
          }
  }
          }          
        `
        return request<{article:{
    articleReadyForSale: {
      //CommandResponse
      errorMessage:string,
			id:string
    } 
  }}>('http://localhost:4000/graphql', document, { payload }).then(p => {
            const response = p.article.articleReadyForSale;
            if (response.errorMessage)
                throw response.errorMessage
            return response.id
        }).catch(err => {
            if (err instanceof Error)
                console.error(err);
            else
                throw err;
            return ""
        })},
			buildArticle:(payload:BuildArticle)=>{
            const document = `
        mutation ($payload: BuildArticle!) {
          article{
    buildArticle(payload:$payload) {
            id
            errorMessage
          }
  }
          }          
        `
        return request<{article:{
    buildArticle: {
      //CommandResponse
      errorMessage:string,
			id:string
    } 
  }}>('http://localhost:4000/graphql', document, { payload }).then(p => {
            const response = p.article.buildArticle;
            if (response.errorMessage)
                throw response.errorMessage
            return response.id
        }).catch(err => {
            if (err instanceof Error)
                console.error(err);
            else
                throw err;
            return ""
        })}
    }
  