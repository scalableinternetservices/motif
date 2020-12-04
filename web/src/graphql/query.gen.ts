/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: FetchUserContext
// ====================================================

export interface FetchUserContext_self {
  __typename: "User";
  id: number;
  name: string;
  userType: UserType;
}

export interface FetchUserContext {
  self: FetchUserContext_self | null;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: FetchUserList
// ====================================================

export interface FetchUserList_users {
  __typename: "User";
  id: number;
}

export interface FetchUserList {
  users: (FetchUserList_users | null)[];
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: MakeMove
// ====================================================

export interface MakeMove {
  makeMove: boolean;
}

export interface MakeMoveVariables {
  input: MoveInput;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: FetchLobbies
// ====================================================

export interface FetchLobbies_lobbies_players {
  __typename: "Player";
  id: number;
}

export interface FetchLobbies_lobbies {
  __typename: "Lobby";
  id: number;
  maxUsers: number;
  gameTime: number;
  state: LobbyState;
  players: FetchLobbies_lobbies_players[];
}

export interface FetchLobbies {
  lobbies: FetchLobbies_lobbies[] | null;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: FetchLobby
// ====================================================

export interface FetchLobby_lobby_players {
  __typename: "Player";
  id: number;
}

export interface FetchLobby_lobby {
  __typename: "Lobby";
  gameTime: number;
  maxUsers: number;
  players: FetchLobby_lobby_players[];
}

export interface FetchLobby {
  lobby: FetchLobby_lobby | null;
}

export interface FetchLobbyVariables {
  lobbyId: number;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: FetchUserName
// ====================================================

export interface FetchUserName {
  username: string | null;
}

export interface FetchUserNameVariables {
  playerId: number;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: FetchUser
// ====================================================

export interface FetchUser_user_player {
  __typename: "Player";
  id: number;
  lobbyId: number | null;
}

export interface FetchUser_user {
  __typename: "User";
  id: number;
  name: string;
  player: FetchUser_user_player | null;
}

export interface FetchUser {
  user: FetchUser_user | null;
}

export interface FetchUserVariables {
  userId: number;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL subscription operation: LobbiesSubscription
// ====================================================

export interface LobbiesSubscription_lobbiesUpdates_players {
  __typename: "Player";
  id: number;
}

export interface LobbiesSubscription_lobbiesUpdates {
  __typename: "Lobby";
  id: number;
  maxUsers: number;
  gameTime: number;
  state: LobbyState;
  players: LobbiesSubscription_lobbiesUpdates_players[];
}

export interface LobbiesSubscription {
  lobbiesUpdates: LobbiesSubscription_lobbiesUpdates[] | null;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL subscription operation: LobbySubscription
// ====================================================

export interface LobbySubscription_lobbyUpdates_players {
  __typename: "Player";
  id: number;
}

export interface LobbySubscription_lobbyUpdates {
  __typename: "Lobby";
  maxUsers: number;
  gameTime: number;
  players: LobbySubscription_lobbyUpdates_players[];
}

export interface LobbySubscription {
  lobbyUpdates: LobbySubscription_lobbyUpdates | null;
}

export interface LobbySubscriptionVariables {
  lobbyId: number;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: CreateLobby
// ====================================================

export interface CreateLobby {
  createLobby: number;
}

export interface CreateLobbyVariables {
  userId: number;
  maxUsers: number;
  maxTime: number;
  state: boolean;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: StartGame
// ====================================================

export interface StartGame {
  startGame: boolean;
}

export interface StartGameVariables {
  lobbyId: number;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: JoinLobby
// ====================================================

export interface JoinLobby {
  joinLobby: boolean;
}

export interface JoinLobbyVariables {
  userId: number;
  lobbyId: number;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: LeaveLobby
// ====================================================

export interface LeaveLobby {
  leaveLobby: boolean;
}

export interface LeaveLobbyVariables {
  userId: number;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: FetchSurveys
// ====================================================

export interface FetchSurveys_surveys_currentQuestion_answers {
  __typename: "SurveyAnswer";
  answer: string;
}

export interface FetchSurveys_surveys_currentQuestion {
  __typename: "SurveyQuestion";
  id: number;
  prompt: string;
  choices: string[] | null;
  answers: FetchSurveys_surveys_currentQuestion_answers[];
}

export interface FetchSurveys_surveys {
  __typename: "Survey";
  id: number;
  name: string;
  isStarted: boolean;
  isCompleted: boolean;
  currentQuestion: FetchSurveys_surveys_currentQuestion | null;
}

export interface FetchSurveys {
  surveys: FetchSurveys_surveys[];
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL subscription operation: SurveySubscription
// ====================================================

export interface SurveySubscription_surveyUpdates_currentQuestion_answers {
  __typename: "SurveyAnswer";
  answer: string;
}

export interface SurveySubscription_surveyUpdates_currentQuestion {
  __typename: "SurveyQuestion";
  id: number;
  prompt: string;
  choices: string[] | null;
  answers: SurveySubscription_surveyUpdates_currentQuestion_answers[];
}

export interface SurveySubscription_surveyUpdates {
  __typename: "Survey";
  id: number;
  name: string;
  isStarted: boolean;
  isCompleted: boolean;
  currentQuestion: SurveySubscription_surveyUpdates_currentQuestion | null;
}

export interface SurveySubscription {
  surveyUpdates: SurveySubscription_surveyUpdates | null;
}

export interface SurveySubscriptionVariables {
  surveyId: number;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: FetchSurvey
// ====================================================

export interface FetchSurvey_survey_currentQuestion_answers {
  __typename: "SurveyAnswer";
  answer: string;
}

export interface FetchSurvey_survey_currentQuestion {
  __typename: "SurveyQuestion";
  id: number;
  prompt: string;
  choices: string[] | null;
  answers: FetchSurvey_survey_currentQuestion_answers[];
}

export interface FetchSurvey_survey {
  __typename: "Survey";
  id: number;
  name: string;
  isStarted: boolean;
  isCompleted: boolean;
  currentQuestion: FetchSurvey_survey_currentQuestion | null;
}

export interface FetchSurvey {
  survey: FetchSurvey_survey | null;
}

export interface FetchSurveyVariables {
  surveyId: number;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: AnswerSurveyQuestion
// ====================================================

export interface AnswerSurveyQuestion {
  answerSurvey: boolean;
}

export interface AnswerSurveyQuestionVariables {
  input: SurveyInput;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: NextSurveyQuestion
// ====================================================

export interface NextSurveyQuestion_nextSurveyQuestion_currentQuestion_answers {
  __typename: "SurveyAnswer";
  answer: string;
}

export interface NextSurveyQuestion_nextSurveyQuestion_currentQuestion {
  __typename: "SurveyQuestion";
  id: number;
  prompt: string;
  choices: string[] | null;
  answers: NextSurveyQuestion_nextSurveyQuestion_currentQuestion_answers[];
}

export interface NextSurveyQuestion_nextSurveyQuestion {
  __typename: "Survey";
  id: number;
  name: string;
  isStarted: boolean;
  isCompleted: boolean;
  currentQuestion: NextSurveyQuestion_nextSurveyQuestion_currentQuestion | null;
}

export interface NextSurveyQuestion {
  nextSurveyQuestion: NextSurveyQuestion_nextSurveyQuestion | null;
}

export interface NextSurveyQuestionVariables {
  surveyId: number;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: Survey
// ====================================================

export interface Survey_currentQuestion_answers {
  __typename: "SurveyAnswer";
  answer: string;
}

export interface Survey_currentQuestion {
  __typename: "SurveyQuestion";
  id: number;
  prompt: string;
  choices: string[] | null;
  answers: Survey_currentQuestion_answers[];
}

export interface Survey {
  __typename: "Survey";
  id: number;
  name: string;
  isStarted: boolean;
  isCompleted: boolean;
  currentQuestion: Survey_currentQuestion | null;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: SurveyQuestion
// ====================================================

export interface SurveyQuestion_answers {
  __typename: "SurveyAnswer";
  answer: string;
}

export interface SurveyQuestion {
  __typename: "SurveyQuestion";
  id: number;
  prompt: string;
  choices: string[] | null;
  answers: SurveyQuestion_answers[];
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum LobbyState {
  IN_GAME = "IN_GAME",
  PRIVATE = "PRIVATE",
  PUBLIC = "PUBLIC",
  REPLAY = "REPLAY",
}

export enum MoveType {
  DeselectTile = "DeselectTile",
  Scramble = "Scramble",
  SelectTile = "SelectTile",
  SpawnTiles = "SpawnTiles",
  Submit = "Submit",
}

export enum TileType {
  Double = "Double",
  Dud = "Dud",
  Normal = "Normal",
}

export enum UserType {
  ADMIN = "ADMIN",
  USER = "USER",
}

export interface MoveInput {
  playerId: number;
  lobbyId: number;
  time: any;
  moveType: MoveType;
  tiles?: TileInput[] | null;
  pointValue?: number | null;
  tileLocation?: number | null;
}

export interface SurveyInput {
  questionId: number;
  answer: string;
}

export interface TileInput {
  letter: string;
  pointValue: number;
  tileType: TileType;
  location: number;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
