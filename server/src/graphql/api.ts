import { readFileSync } from 'fs'
import { GraphQLScalarType, Kind } from 'graphql'
import { PubSub } from 'graphql-yoga'
import path from 'path'
import { getRandomLetter } from '../../../common/src/gameUtils'
import { check } from '../../../common/src/util'
import { Lobby } from '../entities/Lobby'
import { Move } from '../entities/Move'
import { Player } from '../entities/Player'
import { Survey } from '../entities/Survey'
import { SurveyAnswer } from '../entities/SurveyAnswer'
import { SurveyQuestion } from '../entities/SurveyQuestion'
import { Tile } from '../entities/Tile'
import { User } from '../entities/User'
import { LobbyState, MoveType, Resolvers, TileType } from './schema.types'

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
    username: async (_, { playerId }) =>
      (await Player.findOne({ where: { id: playerId }, relations: ['user'] }))?.user?.name || null,
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
        user.player = player
        await user.save()
        await player.save()
      } else {
        player = check(await Player.findOne({ where: { id: user.player.id }, relations: ['lobby'] }))
      }
      const oldLobby = player.lobby
      const newLobby = new Lobby()
      // TODO I'm pretty sure this is actually unnecessary, remove later
      if (oldLobby) {
        // oldLobby.players.splice(oldLobby.players.indexOf(player), 1)
        // await oldLobby.save()
        console.log('LOG: Removing player from old lobby ' + oldLobby.id)
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
        user.player = player
        await user.save()
        await player.save()
      } else {
        player = check(await Player.findOne({ where: { id: user.player.id }, relations: ['lobby'] }))
      }
      const oldLobby = player.lobby
      const newLobby = check(await Lobby.findOne(lobbyId))

      // TODO I'm pretty sure this is actually unnecessary, remove later
      if (oldLobby) {
        // oldLobby.players.splice(oldLobby.players.indexOf(player), 1)
        // await oldLobby.save()
        console.log('LOG: Removing player from old lobby ' + oldLobby.id)
      }
      if (newLobby.maxUsers > newLobby.players.length) {
        // newLobby.players.push(player)
        // await newLobby.save()
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
      if (lobby.players.length <= 1) {
        // delete lobbies that have not started
        if (lobby.state != LobbyState.InGame) {
          await Lobby.remove(lobby)
        } else {
          lobby.state = LobbyState.Replay
          await lobby.save()
        }
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
    createUser: async (_, { name }, ctx) => {
      const user = new User()
      user.name = name
      user.email = 'testemailplsignore@ucla.edu'
      await user.save()
      return true
    },
    makeMove: async (_, { input }, ctx) => {
      console.log('making move start')
      const lobby = check(await Lobby.findOne({ where: { id: input.lobbyId } }), 'makeMove: lobby does not exist')
      if (lobby.state != LobbyState.InGame) return false
      const player = check(
        await Player.findOne({ relations: ['lobby'], where: { id: input.playerId } }),
        'makeMove: player does not exist'
      )
      if (player.lobby.id != input.lobbyId) return false
      const move = new Move()
      move.lobby = lobby
      move.moveType = input.moveType
      move.player = player
      // TODO: check if move is valid
      await move.save()
      switch (input.moveType) {
        case 'SelectTile':
        case 'DeselectTile':
          move.tiles = [new Tile()]
          move.tiles[0].move = move
          const inputTiles = check(input.tiles, 'SelectTile needs Tile in MoveInput.tiles')
          move.tiles[0].letter = inputTiles[0].letter.toUpperCase()
          move.tiles[0].value = inputTiles[0].pointValue
          move.tiles[0].location = inputTiles[0].location
          move.tiles[0].tileType = inputTiles[0].tileType
          await move.save()
          await move.tiles[0].save()
          break
        case 'Submit':
          move.tiles = []
          move.pointValue = check(input.pointValue, 'Submit needs pointvalue')
          // TODO: check that word is in dictionary
          const inputTiles1 = check(input.tiles, 'Submit move needs Tiles in MoveInput.tiles')
          // after Submit, server spawns tiles in those locations
          let serverMove = new Move()
          serverMove.player = player
          serverMove.lobby = lobby
          serverMove.moveType = MoveType.SpawnTiles

          inputTiles1.forEach(async tile => {
            // save a copy of the tile for Submit move
            const newTile = new Tile()
            newTile.letter = tile.letter.toUpperCase()
            newTile.location = tile.location
            newTile.move = move
            newTile.value = tile.pointValue
            newTile.tileType = tile.tileType
            await newTile.save()
            move.tiles.push(newTile)
            // spawn a new tile in the location by server
            const spawnedTile = new Tile()
            spawnedTile.letter = getRandomLetter()
            spawnedTile.location = tile.location
            spawnedTile.move = serverMove
            spawnedTile.value = 1
            spawnedTile.tileType = TileType.Normal
            await spawnedTile.save()
          })
          await serverMove.save()
          break
        case 'Scramble':
          serverMove = new Move()
          serverMove.player = player
          serverMove.lobby = lobby
          serverMove.moveType = MoveType.SpawnTiles
          for (let i = 0; i < 16; i++) {
            const spawnedTile = new Tile()
            spawnedTile.letter = getRandomLetter()
            spawnedTile.location = i
            spawnedTile.move = serverMove
            spawnedTile.value = 1
            spawnedTile.tileType = TileType.Normal
            await spawnedTile.save()
          }
          await serverMove.save()
          break
        case 'SpawnTiles':
          // TODO: this is for testing, otherwise should be automated by server
          move.tiles = []
          const inputTiles2 = check(input.tiles, 'SpawnTiles needs Tiles in MoveInput.tiles')
          inputTiles2.forEach(async tile => {
            const newTile = new Tile()
            newTile.letter = tile.letter.toUpperCase()
            newTile.location = tile.location
            newTile.move = move
            newTile.value = tile.pointValue
            newTile.tileType = tile.tileType
            await newTile.save()
            move.tiles.push(newTile)
          })
          break
      }
      await move.save()
      return true
    },
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
