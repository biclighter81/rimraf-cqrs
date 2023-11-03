import { GraphQLResolveInfo } from 'graphql';
import { GraphQlContext } from '../Graphql.context';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type ArticleCommands = {
  __typename?: 'ArticleCommands';
  articleReadyForSale: CommandResponse;
  buildArticle: CommandResponse;
  changePrice: CommandResponse;
  disable: CommandResponse;
};


export type ArticleCommandsArticleReadyForSaleArgs = {
  payload: ArticleReadyForSale;
};


export type ArticleCommandsBuildArticleArgs = {
  payload: BuildArticle;
};


export type ArticleCommandsChangePriceArgs = {
  articleId: Scalars['ID']['input'];
  newPrice: Scalars['Int']['input'];
};


export type ArticleCommandsDisableArgs = {
  articleId: Scalars['ID']['input'];
};

export type ArticleReadyForSale = {
  articleId: Scalars['ID']['input'];
  price: Scalars['Int']['input'];
};

export type BuildArticle = {
  name: Scalars['String']['input'];
};

export type CommandResponse = {
  __typename?: 'CommandResponse';
  errorMessage?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  article?: Maybe<ArticleCommands>;
};

export type Query = {
  __typename?: 'Query';
  healthCheck: Scalars['String']['output'];
};

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  ArticleCommands: ResolverTypeWrapper<ArticleCommands>;
  ArticleReadyForSale: ArticleReadyForSale;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  BuildArticle: BuildArticle;
  CommandResponse: ResolverTypeWrapper<CommandResponse>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Mutation: ResolverTypeWrapper<{}>;
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  ArticleCommands: ArticleCommands;
  ArticleReadyForSale: ArticleReadyForSale;
  Boolean: Scalars['Boolean']['output'];
  BuildArticle: BuildArticle;
  CommandResponse: CommandResponse;
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  Mutation: {};
  Query: {};
  String: Scalars['String']['output'];
}>;

export type ArticleCommandsResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['ArticleCommands'] = ResolversParentTypes['ArticleCommands']> = ResolversObject<{
  articleReadyForSale?: Resolver<ResolversTypes['CommandResponse'], ParentType, ContextType, RequireFields<ArticleCommandsArticleReadyForSaleArgs, 'payload'>>;
  buildArticle?: Resolver<ResolversTypes['CommandResponse'], ParentType, ContextType, RequireFields<ArticleCommandsBuildArticleArgs, 'payload'>>;
  changePrice?: Resolver<ResolversTypes['CommandResponse'], ParentType, ContextType, RequireFields<ArticleCommandsChangePriceArgs, 'articleId' | 'newPrice'>>;
  disable?: Resolver<ResolversTypes['CommandResponse'], ParentType, ContextType, RequireFields<ArticleCommandsDisableArgs, 'articleId'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CommandResponseResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['CommandResponse'] = ResolversParentTypes['CommandResponse']> = ResolversObject<{
  errorMessage?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  article?: Resolver<Maybe<ResolversTypes['ArticleCommands']>, ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  healthCheck?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type Resolvers<ContextType = GraphQlContext> = ResolversObject<{
  ArticleCommands?: ArticleCommandsResolvers<ContextType>;
  CommandResponse?: CommandResponseResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
}>;

