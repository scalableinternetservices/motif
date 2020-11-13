import { readFileSync } from 'fs'
import { GraphQLScalarType, Kind } from 'graphql'
import { PubSub } from 'graphql-yoga'
import path from 'path'
import { check } from '../../../common/src/util'
import { Lobby } from '../entities/Lobby'
import { Player } from '../entities/Player'
import { Survey } from '../entities/Survey'
import { SurveyAnswer } from '../entities/SurveyAnswer'
import { SurveyQuestion } from '../entities/SurveyQuestion'
import { User } from '../entities/User'
import { LobbyState, Resolvers } from './schema.types'

export const pubsub = new PubSub()

export function getSchema() {
  const schema = readFileSync(path.join(__dirname, 'schema.graphql'))
  return schema.toString()
}

interface Context {
  user: User | null
  request: Request
  response: Response
  pubsub: PubSub
}

export const graphqlRoot: Resolvers<Context> = {
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar',
    parseValue(value) {
      return new Date(value)
    },
    serialize(value) {
      return value.getTime()
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return parseInt(ast.value, 10)
      }
      return null
    },
  }),
  Query: {
    self: (_, args, ctx) => ctx.user,
    survey: async (_, { surveyId }) => (await Survey.findOne({ where: { id: surveyId } })) || null,
    surveys: () => Survey.find(),
    lobbies: () => Lobby.find(),
    lobby: async (_, { lobbyId }) => (await Lobby.findOne({ where: { id: lobbyId } })) || null,
    users: () => User.find(),
  },
  Mutation: {
    answerSurvey: async (_, { input }, ctx) => {
      const { answer, questionId } = input
      const question = check(await SurveyQuestion.findOne({ where: { id: questionId }, relations: ['survey'] }))

      const surveyAnswer = new SurveyAnswer()
      surveyAnswer.question = question
      surveyAnswer.answer = answer
      await surveyAnswer.save()

      question.survey.currentQuestion?.answers.push(surveyAnswer)
      ctx.pubsub.publish('SURVEY_UPDATE_' + question.survey.id, question.survey)

      return true
    },
    nextSurveyQuestion: async (_, { surveyId }, ctx) => {
      // check(ctx.user?.userType === UserType.Admin)
      const survey = check(await Survey.findOne({ where: { id: surveyId } }))
      survey.currQuestion = survey.currQuestion == null ? 0 : survey.currQuestion + 1
      await survey.save()
      ctx.pubsub.publish('SURVEY_UPDATE_' + surveyId, survey)
      return survey
    },
    createLobby: async (_, { userId, maxUsers, maxTime, state }, ctx) => {
      const user = check(await User.findOne({ where: { id: userId }, relations: ['player'] }))
      // Create new player if DNE
      let player
      if (!user.player) {
        player = new Player()
        player.user = user
        await player.save()
      } else {
        player = user.player
      }
      const oldLobby = player.lobby
      const newLobby = new Lobby()
      // Remove player from old lobby
      if (oldLobby && oldLobby.players.indexOf(player) > -1) {
        oldLobby.players.splice(oldLobby.players.indexOf(player), 1)
        await oldLobby.save()
      }
      // Add player to new lobby
      newLobby.state = state ? LobbyState.Public : LobbyState.Private
      newLobby.maxUsers = maxUsers
      newLobby.gameTime = maxTime
      await newLobby.save()
      player.lobby = newLobby
      await player.save()
      return newLobby.id
    },
    joinLobby: async (_, { userId, lobbyId }, ctx) => {
      // TODO: need to validate: remove user from current lobbies, is lobby in right state, etc
      const user = check(await User.findOne({ where: { id: userId }, relations: ['player'] }))
      let player
      if (!user.player) {
        player = new Player()
        player.user = user
        await player.save()
      } else {
        player = user.player
      }
      const oldLobby = player.lobby
      const newLobby = check(await Lobby.findOne(lobbyId))

      if (oldLobby && oldLobby.players.indexOf(player) > -1) {
        oldLobby.players.splice(oldLobby.players.indexOf(player), 1)
        await oldLobby.save()
      }
      if (newLobby.maxUsers > newLobby.players.length) {
        newLobby.players.push(player)
        await newLobby.save()
      } else {
        return false
      }
      player.lobby = newLobby
      await player.save()
      return true
    },
    leaveLobby: async (_, { userId }, ctx) => {
      const player = check(await Player.findOne({ where: { user: userId }, relations: ['user', 'lobby'] }))
      const lobby = player.lobby
      if (!lobby) return false
      if (lobby.players.length == 1) {
        // TODO delete lobbies that have not started
        lobby.state = LobbyState.Replay
        await lobby.save()
      }
      // delete as Player, since user no longer in any lobbies
      await Player.remove(player)
      return true
    },
    startGame: async (_, { lobbyId }, ctx) => {
      // TODO take player param and check if in lobby
      const lobby = check(await Lobby.findOne({ where: { id: lobbyId } }))
      if (lobby.state != LobbyState.Private && lobby.state != LobbyState.Public) return false
      lobby.state = LobbyState.InGame
      lobby.startTime = new Date()
      await lobby.save()
      return true
    },
    // makeMove: async (_, { input }, ctx) => {
    //   // TODO: check if move is valid, insert in db, then return true/false
    //   switch (input.moveType) {
    //     case 'SelectTile':
    //       break
    //     case 'DeselectTile':
    //       break
    //     case 'Submit':
    //       break
    //     case 'Scramble':
    //       break
    //     case 'SpawnTiles':
    //       break
    //   }
    //   return false
    // },
  },
  Subscription: {
    surveyUpdates: {
      subscribe: (_, { surveyId }, context) => context.pubsub.asyncIterator('SURVEY_UPDATE_' + surveyId),
      resolve: (payload: any) => payload,
    },
  },
  // Apollo requires that a GraphQL interface has this resolver to distinguish implementations
  Move: {
    __resolveType(move, context, info) {
      return move.moveType
    },
  },
}
