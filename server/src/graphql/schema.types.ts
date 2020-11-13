import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql'
export type Maybe<T> = T | null
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } &
  { [P in K]-?: NonNullable<T[P]> }
/** All built-in and custom scalars, mapped to their actual values */
export interface Scalars {
  ID: string
  String: string
  Boolean: boolean
  Int: number
  Float: number
  Date: any
}

export interface Query {
  __typename?: 'Query'
  self?: Maybe<User>
  surveys: Array<Survey>
  survey?: Maybe<Survey>
  lobbies?: Maybe<Array<Lobby>>
  lobby?: Maybe<Lobby>
  users: Array<Maybe<User>>
  username?: Maybe<Scalars['String']>
}

export interface QuerySurveyArgs {
  surveyId: Scalars['Int']
}

export interface QueryLobbyArgs {
  lobbyId: Scalars['Int']
}

export interface QueryUsernameArgs {
  playerId: Scalars['Int']
}

export interface Mutation {
  __typename?: 'Mutation'
  answerSurvey: Scalars['Boolean']
  nextSurveyQuestion?: Maybe<Survey>
  createUser: Scalars['Boolean']
  joinLobby: Scalars['Boolean']
  leaveLobby: Scalars['Boolean']
  startGame: Scalars['Boolean']
  makeMove: Scalars['Boolean']
  createLobby: Scalars['Int']
}

export interface MutationAnswerSurveyArgs {
  input: SurveyInput
}

export interface MutationNextSurveyQuestionArgs {
  surveyId: Scalars['Int']
}

export interface MutationCreateUserArgs {
  name: Scalars['String']
}

export interface MutationJoinLobbyArgs {
  userId: Scalars['Int']
  lobbyId: Scalars['Int']
}

export interface MutationLeaveLobbyArgs {
  userId: Scalars['Int']
}

export interface MutationStartGameArgs {
  lobbyId: Scalars['Int']
}

export interface MutationMakeMoveArgs {
  input: MoveInput
}

export interface MutationCreateLobbyArgs {
  userId: Scalars['Int']
  maxUsers: Scalars['Int']
  maxTime: Scalars['Int']
  state: Scalars['Boolean']
}

export interface Subscription {
  __typename?: 'Subscription'
  surveyUpdates?: Maybe<Survey>
}

export interface SubscriptionSurveyUpdatesArgs {
  surveyId: Scalars['Int']
}

export interface User {
  __typename?: 'User'
  id: Scalars['Int']
  userType: UserType
  email: Scalars['String']
  name: Scalars['String']
}

export enum UserType {
  Admin = 'ADMIN',
  User = 'USER',
}

export interface Survey {
  __typename?: 'Survey'
  id: Scalars['Int']
  name: Scalars['String']
  isStarted: Scalars['Boolean']
  isCompleted: Scalars['Boolean']
  currentQuestion?: Maybe<SurveyQuestion>
  questions: Array<Maybe<SurveyQuestion>>
}

export interface SurveyQuestion {
  __typename?: 'SurveyQuestion'
  id: Scalars['Int']
  prompt: Scalars['String']
  choices?: Maybe<Array<Scalars['String']>>
  answers: Array<SurveyAnswer>
  survey: Survey
}

export interface SurveyAnswer {
  __typename?: 'SurveyAnswer'
  id: Scalars['Int']
  answer: Scalars['String']
  question: SurveyQuestion
}

export interface SurveyInput {
  questionId: Scalars['Int']
  answer: Scalars['String']
}

export interface Player {
  __typename?: 'Player'
  id: Scalars['Int']
  lobby?: Maybe<Lobby>
}

export enum TileType {
  Normal = 'Normal',
  Double = 'Double',
  Dud = 'Dud',
}

export interface Tile {
  __typename?: 'Tile'
  id: Scalars['Int']
  value: Scalars['Int']
  location: Scalars['Int']
  letter: Scalars['String']
  tileType: TileType
}

export enum MoveType {
  SelectTile = 'SelectTile',
  DeselectTile = 'DeselectTile',
  Submit = 'Submit',
  Scramble = 'Scramble',
  SpawnTiles = 'SpawnTiles',
}

export interface Move {
  player: Player
  time: Scalars['Date']
  moveType: MoveType
}

export interface SelectTile extends Move {
  __typename?: 'SelectTile'
  player: Player
  time: Scalars['Date']
  moveType: MoveType
  tiles: Array<Tile>
}

export interface DeselectTile extends Move {
  __typename?: 'DeselectTile'
  player: Player
  time: Scalars['Date']
  moveType: MoveType
  tiles: Array<Tile>
}

export interface Submit extends Move {
  __typename?: 'Submit'
  id: Scalars['Int']
  player: Player
  time: Scalars['Date']
  moveType: MoveType
  tiles: Array<Tile>
  pointValue: Scalars['Int']
}

export interface Scramble extends Move {
  __typename?: 'Scramble'
  player: Player
  time: Scalars['Date']
  moveType: MoveType
}

export interface SpawnTiles extends Move {
  __typename?: 'SpawnTiles'
  player: Player
  time: Scalars['Date']
  moveType: MoveType
  tiles: Array<Tile>
}

export interface TileInput {
  letter: Scalars['String']
  pointValue: Scalars['Int']
  tileType: TileType
  location: Scalars['Int']
}

export interface MoveInput {
  playerId: Scalars['Int']
  lobbyId: Scalars['Int']
  time: Scalars['Date']
  moveType: MoveType
  tiles?: Maybe<Array<TileInput>>
  pointValue?: Maybe<Scalars['Int']>
  tileLocation?: Maybe<Scalars['Int']>
}

export enum LobbyState {
  Public = 'PUBLIC',
  Private = 'PRIVATE',
  InGame = 'IN_GAME',
  Replay = 'REPLAY',
}

export interface Lobby {
  __typename?: 'Lobby'
  id: Scalars['Int']
  state: LobbyState
  players: Array<Player>
  spectators: Array<Player>
  moves: Array<Move>
  gameTime: Scalars['Int']
  maxUsers: Scalars['Int']
}

export type ResolverTypeWrapper<T> = Promise<T> | T

export type LegacyStitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>
}

export type NewStitchingResolver<TResult, TParent, TContext, TArgs> = {
  selectionSet: string
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>
}
export type StitchingResolver<TResult, TParent, TContext, TArgs> =
  | LegacyStitchingResolver<TResult, TParent, TContext, TArgs>
  | NewStitchingResolver<TResult, TParent, TContext, TArgs>
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | StitchingResolver<TResult, TParent, TContext, TArgs>

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>

export type IsTypeOfResolverFn<T = {}> = (obj: T, info: GraphQLResolveInfo) => boolean | Promise<boolean>

export type NextResolverFn<T> = () => Promise<T>

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Query: ResolverTypeWrapper<{}>
  Int: ResolverTypeWrapper<Scalars['Int']>
  String: ResolverTypeWrapper<Scalars['String']>
  Mutation: ResolverTypeWrapper<{}>
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>
  Subscription: ResolverTypeWrapper<{}>
  User: ResolverTypeWrapper<User>
  UserType: UserType
  Survey: ResolverTypeWrapper<Survey>
  SurveyQuestion: ResolverTypeWrapper<SurveyQuestion>
  SurveyAnswer: ResolverTypeWrapper<SurveyAnswer>
  SurveyInput: SurveyInput
  Player: ResolverTypeWrapper<Player>
  TileType: TileType
  Tile: ResolverTypeWrapper<Tile>
  Date: ResolverTypeWrapper<Scalars['Date']>
  MoveType: MoveType
  Move:
    | ResolversTypes['SelectTile']
    | ResolversTypes['DeselectTile']
    | ResolversTypes['Submit']
    | ResolversTypes['Scramble']
    | ResolversTypes['SpawnTiles']
  SelectTile: ResolverTypeWrapper<SelectTile>
  DeselectTile: ResolverTypeWrapper<DeselectTile>
  Submit: ResolverTypeWrapper<Submit>
  Scramble: ResolverTypeWrapper<Scramble>
  SpawnTiles: ResolverTypeWrapper<SpawnTiles>
  TileInput: TileInput
  MoveInput: MoveInput
  LobbyState: LobbyState
  Lobby: ResolverTypeWrapper<Lobby>
}

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Query: {}
  Int: Scalars['Int']
  String: Scalars['String']
  Mutation: {}
  Boolean: Scalars['Boolean']
  Subscription: {}
  User: User
  Survey: Survey
  SurveyQuestion: SurveyQuestion
  SurveyAnswer: SurveyAnswer
  SurveyInput: SurveyInput
  Player: Player
  Tile: Tile
  Date: Scalars['Date']
  Move:
    | ResolversParentTypes['SelectTile']
    | ResolversParentTypes['DeselectTile']
    | ResolversParentTypes['Submit']
    | ResolversParentTypes['Scramble']
    | ResolversParentTypes['SpawnTiles']
  SelectTile: SelectTile
  DeselectTile: DeselectTile
  Submit: Submit
  Scramble: Scramble
  SpawnTiles: SpawnTiles
  TileInput: TileInput
  MoveInput: MoveInput
  Lobby: Lobby
}

export type QueryResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']
> = {
  self?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>
  surveys?: Resolver<Array<ResolversTypes['Survey']>, ParentType, ContextType>
  survey?: Resolver<
    Maybe<ResolversTypes['Survey']>,
    ParentType,
    ContextType,
    RequireFields<QuerySurveyArgs, 'surveyId'>
  >
  lobbies?: Resolver<Maybe<Array<ResolversTypes['Lobby']>>, ParentType, ContextType>
  lobby?: Resolver<Maybe<ResolversTypes['Lobby']>, ParentType, ContextType, RequireFields<QueryLobbyArgs, 'lobbyId'>>
  users?: Resolver<Array<Maybe<ResolversTypes['User']>>, ParentType, ContextType>
  username?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType,
    RequireFields<QueryUsernameArgs, 'playerId'>
  >
}

export type MutationResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']
> = {
  answerSurvey?: Resolver<
    ResolversTypes['Boolean'],
    ParentType,
    ContextType,
    RequireFields<MutationAnswerSurveyArgs, 'input'>
  >
  nextSurveyQuestion?: Resolver<
    Maybe<ResolversTypes['Survey']>,
    ParentType,
    ContextType,
    RequireFields<MutationNextSurveyQuestionArgs, 'surveyId'>
  >
  createUser?: Resolver<
    ResolversTypes['Boolean'],
    ParentType,
    ContextType,
    RequireFields<MutationCreateUserArgs, 'name'>
  >
  joinLobby?: Resolver<
    ResolversTypes['Boolean'],
    ParentType,
    ContextType,
    RequireFields<MutationJoinLobbyArgs, 'userId' | 'lobbyId'>
  >
  leaveLobby?: Resolver<
    ResolversTypes['Boolean'],
    ParentType,
    ContextType,
    RequireFields<MutationLeaveLobbyArgs, 'userId'>
  >
  startGame?: Resolver<
    ResolversTypes['Boolean'],
    ParentType,
    ContextType,
    RequireFields<MutationStartGameArgs, 'lobbyId'>
  >
  makeMove?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationMakeMoveArgs, 'input'>>
  createLobby?: Resolver<
    ResolversTypes['Int'],
    ParentType,
    ContextType,
    RequireFields<MutationCreateLobbyArgs, 'userId' | 'maxUsers' | 'maxTime' | 'state'>
  >
}

export type SubscriptionResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']
> = {
  surveyUpdates?: SubscriptionResolver<
    Maybe<ResolversTypes['Survey']>,
    'surveyUpdates',
    ParentType,
    ContextType,
    RequireFields<SubscriptionSurveyUpdatesArgs, 'surveyId'>
  >
}

export type UserResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']
> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
  userType?: Resolver<ResolversTypes['UserType'], ParentType, ContextType>
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  __isTypeOf?: IsTypeOfResolverFn<ParentType>
}

export type SurveyResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Survey'] = ResolversParentTypes['Survey']
> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  isStarted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>
  isCompleted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>
  currentQuestion?: Resolver<Maybe<ResolversTypes['SurveyQuestion']>, ParentType, ContextType>
  questions?: Resolver<Array<Maybe<ResolversTypes['SurveyQuestion']>>, ParentType, ContextType>
  __isTypeOf?: IsTypeOfResolverFn<ParentType>
}

export type SurveyQuestionResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['SurveyQuestion'] = ResolversParentTypes['SurveyQuestion']
> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
  prompt?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  choices?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>
  answers?: Resolver<Array<ResolversTypes['SurveyAnswer']>, ParentType, ContextType>
  survey?: Resolver<ResolversTypes['Survey'], ParentType, ContextType>
  __isTypeOf?: IsTypeOfResolverFn<ParentType>
}

export type SurveyAnswerResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['SurveyAnswer'] = ResolversParentTypes['SurveyAnswer']
> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
  answer?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  question?: Resolver<ResolversTypes['SurveyQuestion'], ParentType, ContextType>
  __isTypeOf?: IsTypeOfResolverFn<ParentType>
}

export type PlayerResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Player'] = ResolversParentTypes['Player']
> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
  lobby?: Resolver<Maybe<ResolversTypes['Lobby']>, ParentType, ContextType>
  __isTypeOf?: IsTypeOfResolverFn<ParentType>
}

export type TileResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Tile'] = ResolversParentTypes['Tile']
> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
  value?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
  location?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
  letter?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  tileType?: Resolver<ResolversTypes['TileType'], ParentType, ContextType>
  __isTypeOf?: IsTypeOfResolverFn<ParentType>
}

export interface DateScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Date'], any> {
  name: 'Date'
}

export type MoveResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Move'] = ResolversParentTypes['Move']
> = {
  __resolveType: TypeResolveFn<
    'SelectTile' | 'DeselectTile' | 'Submit' | 'Scramble' | 'SpawnTiles',
    ParentType,
    ContextType
  >
  player?: Resolver<ResolversTypes['Player'], ParentType, ContextType>
  time?: Resolver<ResolversTypes['Date'], ParentType, ContextType>
  moveType?: Resolver<ResolversTypes['MoveType'], ParentType, ContextType>
}

export type SelectTileResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['SelectTile'] = ResolversParentTypes['SelectTile']
> = {
  player?: Resolver<ResolversTypes['Player'], ParentType, ContextType>
  time?: Resolver<ResolversTypes['Date'], ParentType, ContextType>
  moveType?: Resolver<ResolversTypes['MoveType'], ParentType, ContextType>
  tiles?: Resolver<Array<ResolversTypes['Tile']>, ParentType, ContextType>
  __isTypeOf?: IsTypeOfResolverFn<ParentType>
}

export type DeselectTileResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['DeselectTile'] = ResolversParentTypes['DeselectTile']
> = {
  player?: Resolver<ResolversTypes['Player'], ParentType, ContextType>
  time?: Resolver<ResolversTypes['Date'], ParentType, ContextType>
  moveType?: Resolver<ResolversTypes['MoveType'], ParentType, ContextType>
  tiles?: Resolver<Array<ResolversTypes['Tile']>, ParentType, ContextType>
  __isTypeOf?: IsTypeOfResolverFn<ParentType>
}

export type SubmitResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Submit'] = ResolversParentTypes['Submit']
> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
  player?: Resolver<ResolversTypes['Player'], ParentType, ContextType>
  time?: Resolver<ResolversTypes['Date'], ParentType, ContextType>
  moveType?: Resolver<ResolversTypes['MoveType'], ParentType, ContextType>
  tiles?: Resolver<Array<ResolversTypes['Tile']>, ParentType, ContextType>
  pointValue?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
  __isTypeOf?: IsTypeOfResolverFn<ParentType>
}

export type ScrambleResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Scramble'] = ResolversParentTypes['Scramble']
> = {
  player?: Resolver<ResolversTypes['Player'], ParentType, ContextType>
  time?: Resolver<ResolversTypes['Date'], ParentType, ContextType>
  moveType?: Resolver<ResolversTypes['MoveType'], ParentType, ContextType>
  __isTypeOf?: IsTypeOfResolverFn<ParentType>
}

export type SpawnTilesResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['SpawnTiles'] = ResolversParentTypes['SpawnTiles']
> = {
  player?: Resolver<ResolversTypes['Player'], ParentType, ContextType>
  time?: Resolver<ResolversTypes['Date'], ParentType, ContextType>
  moveType?: Resolver<ResolversTypes['MoveType'], ParentType, ContextType>
  tiles?: Resolver<Array<ResolversTypes['Tile']>, ParentType, ContextType>
  __isTypeOf?: IsTypeOfResolverFn<ParentType>
}

export type LobbyResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Lobby'] = ResolversParentTypes['Lobby']
> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
  state?: Resolver<ResolversTypes['LobbyState'], ParentType, ContextType>
  players?: Resolver<Array<ResolversTypes['Player']>, ParentType, ContextType>
  spectators?: Resolver<Array<ResolversTypes['Player']>, ParentType, ContextType>
  moves?: Resolver<Array<ResolversTypes['Move']>, ParentType, ContextType>
  gameTime?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
  maxUsers?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
  __isTypeOf?: IsTypeOfResolverFn<ParentType>
}

export type Resolvers<ContextType = any> = {
  Query?: QueryResolvers<ContextType>
  Mutation?: MutationResolvers<ContextType>
  Subscription?: SubscriptionResolvers<ContextType>
  User?: UserResolvers<ContextType>
  Survey?: SurveyResolvers<ContextType>
  SurveyQuestion?: SurveyQuestionResolvers<ContextType>
  SurveyAnswer?: SurveyAnswerResolvers<ContextType>
  Player?: PlayerResolvers<ContextType>
  Tile?: TileResolvers<ContextType>
  Date?: GraphQLScalarType
  Move?: MoveResolvers<ContextType>
  SelectTile?: SelectTileResolvers<ContextType>
  DeselectTile?: DeselectTileResolvers<ContextType>
  Submit?: SubmitResolvers<ContextType>
  Scramble?: ScrambleResolvers<ContextType>
  SpawnTiles?: SpawnTilesResolvers<ContextType>
  Lobby?: LobbyResolvers<ContextType>
}

/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = any> = Resolvers<ContextType>
