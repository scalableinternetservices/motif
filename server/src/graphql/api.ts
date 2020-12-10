import console from 'console'
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
import Dictionary from './dictionary'
import { LobbyState, MoveType, Resolvers, TileType } from './schema.types'

export const pubsub = new PubSub()
export const dictionary = new Dictionary()

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
    self: (_, args, ctx) => ctx.user as any,
    survey: async (_, { surveyId }) => (await Survey.findOne({ where: { id: surveyId } })) || null,
    surveys: () => Survey.find(),
    lobbies: async () => (await Lobby.find()) as any,
    lobby: async (_, { lobbyId }) => ((await Lobby.findOne({ where: { id: lobbyId } })) || null) as any,
    activeLobbies: async () =>
      (await Lobby.find({
        where: [{ state: LobbyState.Private }, { state: LobbyState.Public }],
      })) as any,
    user: async (_, { userId }) => ((await User.findOne({ where: { id: userId } })) || null) as any,
    users: async () => (await User.find()) as any,
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
      const newLobby = new Lobby()
      newLobby.state = state ? LobbyState.Public : LobbyState.Private
      newLobby.maxUsers = maxUsers
      newLobby.gameTime = maxTime
      await newLobby.save()

      let player = await Player.findOne({ where: { userId: userId } })
      if (!player) {
        player = new Player()
        player.userId = userId
        player.lobby = newLobby
        await player.save()
      } else {
        const oldLobby = await Lobby.findOne(player.lobbyId)
        player.lobby = newLobby
        await player.save()
        if (oldLobby) {
          console.log('LOG: Removing player from old lobby ' + oldLobby.id)
          const oldPlayers = await Player.find({ where: { lobbyId: oldLobby.id } })
          if (oldPlayers.length < 1) {
            console.log('LOG: Deleting empty lobby ' + oldLobby.id)
            if (oldLobby.state != LobbyState.InGame) {
              await Lobby.remove(oldLobby)
            } else {
              oldLobby.state = LobbyState.Replay
              await oldLobby.save()
            }
          } else {
            const updatedOldLobby = check(await Lobby.findOne(oldLobby.id))
            ctx.pubsub.publish('LOBBY_UPDATE_' + oldLobby.id, updatedOldLobby) //send update to old lobby
          }
        }
      }

      // Get all lobbies and pass as payload for lobbiesUpdates subscripton
      const lobbies = check(
        await Lobby.find({
          where: [{ state: LobbyState.Private }, { state: LobbyState.Public }],
        })
      )
      ctx.pubsub.publish('LOBBIES_UPDATE', lobbies)

      const updatedLobby = check(await Lobby.findOne(newLobby.id))
      ctx.pubsub.publish('LOBBY_UPDATE_' + newLobby.id, updatedLobby)

      return newLobby.id
    },
    joinLobby: async (_, { userId, lobbyId }, ctx) => {
      // TODO: need to validate: remove user from current lobbies, is lobby in right state, etc
      const newLobby = check(await Lobby.findOne(lobbyId))
      const players = await Player.find({ where: { lobbyId: lobbyId } })
      if (newLobby.maxUsers <= players.length) {
        return false
      }

      // create player if DNE
      let player = await Player.findOne({ where: { userId: userId } })
      if (!player) {
        player = new Player()
        player.userId = userId
        player.lobby = newLobby
        await player.save()
      } else {
        const oldLobby = await Lobby.findOne(player.lobbyId)
        player.lobby = newLobby
        await player.save()

        // if player exists already, check to see if old lobbies need to be cleaned up
        if (oldLobby) {
          console.log('LOG: Removing player from old lobby ' + oldLobby.id)
          const oldPlayers = await Player.find({ where: { lobbyId: oldLobby.id } })
          if (oldPlayers.length < 1) {
            console.log('LOG: Deleting empty lobby ' + oldLobby.id)
            if (oldLobby.state != LobbyState.InGame) {
              await Lobby.remove(oldLobby)
            } else {
              oldLobby.state = LobbyState.Replay
              await oldLobby.save()
            }
          } else {
            const updatedOldLobby = check(await Lobby.findOne(oldLobby.id))
            ctx.pubsub.publish('LOBBY_UPDATE_' + oldLobby.id, updatedOldLobby) //send update to old lobby
          }
        }
      }

      //Get all lobbies and pass as payload for lobbiesUpdates subscripton
      const lobbies = check(
        await Lobby.find({
          where: [{ state: LobbyState.Private }, { state: LobbyState.Public }],
        })
      )
      ctx.pubsub.publish('LOBBIES_UPDATE', lobbies)

      //pass the current updated lobby as payload for lobbyUpdates subscription
      const updatedNewLobby = check(await Lobby.findOne(newLobby.id))
      ctx.pubsub.publish('LOBBY_UPDATE_' + newLobby.id, updatedNewLobby) //send update to new lobby

      return true
    },
    leaveLobby: async (_, { userId }, ctx) => {
      const player = check(await Player.findOne({ where: { userId: userId } }))
      const lobby = await Lobby.findOne(player.lobbyId)

      if (!lobby) return false

      const players = await Player.find({ where: { lobbyId: lobby.id } })
      if (players.length <= 1) {
        console.log('LOG: Deleting empty lobby ' + lobby.id)
        // delete lobbies that have not started
        if (lobby.state != LobbyState.InGame) {
          await Lobby.remove(lobby)
        } else {
          lobby.state = LobbyState.Replay
          await lobby.save()
        }
      } else {
        //No need to update the subscribers of the lobby if the lobby is removed
        const updatedLobby = check(await Lobby.findOne({ where: { id: lobby.id } }))
        //pass the current updated lobby as payload for lobbyUpdates subscription
        ctx.pubsub.publish('LOBBY_UPDATE_' + lobby.id, updatedLobby)
      }
      // delete as Player, since user no longer in any lobbies
      await Player.remove(player)

      // //Get all lobbies and pass as payload for lobbiesUpdates subscripton
      const lobbies = check(
        await Lobby.find({
          where: [{ state: LobbyState.Private }, { state: LobbyState.Public }],
        })
      )
      ctx.pubsub.publish('LOBBIES_UPDATE', lobbies)

      return true
    },
    startGame: async (_, { lobbyId }, ctx) => {
      // TODO take player param and check if in lobby
      // const conn = await getConnection()
      // const sql = new SQL(conn)
      // const start_q = await sql.query(
      //   'UPDATE lobby SET state = ?, startTime = NOW() WHERE state IN (?, ?) AND id = ?',
      //   [LobbyState.InGame, LobbyState.Private, LobbyState.Public, lobbyId]
      // )
      // conn.release()
      // if (start_q.affectedRows != 1) return false
      const lobby = check(await Lobby.findOne({ where: { id: lobbyId } }))
      if (lobby.state != LobbyState.Private && lobby.state != LobbyState.Public) return false
      lobby.state = LobbyState.InGame
      lobby.startTime = new Date()
      await lobby.save()

      //Get all lobbies and pass as payload for lobbiesUpdates subscripton
      const lobbies = check(
        await Lobby.find({
          where: [{ state: LobbyState.Private }, { state: LobbyState.Public }],
        })
      )
      ctx.pubsub.publish('LOBBIES_UPDATE', lobbies)

      //pass the current updated lobby as payload for lobbyUpdates subscription
      const updatedLobby = check(await Lobby.findOne({ where: { id: lobbyId } }))
      ctx.pubsub.publish('LOBBY_UPDATE_' + lobbyId, updatedLobby)

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
      console.log('making move start ')
      const lobby = check(await Lobby.findOne({ where: { id: input.lobbyId } }), 'makeMove: lobby does not exist')
      if (lobby.state != LobbyState.InGame) {
        console.log('Lobby State mismatch')
        //return false
      }
      const player = check(
        await Player.findOne({ relations: ['lobby'], where: { id: input.playerId } }),
        'makeMove: player does not exist'
      )
      //const lobby = player.lobby
      if (player.lobby.id != input.lobbyId) {
        console.log('PlayerID mismatch')
        //return false
      }
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
          const serverMove = new Move()
          serverMove.player = player
          serverMove.lobby = lobby
          serverMove.moveType = MoveType.SpawnTiles
          let word = ''
          inputTiles1.forEach(async tile => {
            // save a copy of the tile for Submit move
            word = word + tile.letter
            const newTile = new Tile()
            newTile.letter = tile.letter.toUpperCase()
            newTile.location = tile.location
            newTile.move = move
            newTile.value = tile.pointValue
            newTile.tileType = tile.tileType
            await newTile.save().catch(() => console.log('broke here'))
            move.tiles.push(newTile)
            // spawn a new tile in the location by server
            const spawnedTile = new Tile()
            spawnedTile.letter = getRandomLetter()
            spawnedTile.location = tile.location
            spawnedTile.move = serverMove
            spawnedTile.value = 1
            spawnedTile.tileType = TileType.Normal
            await spawnedTile.save().catch(() => console.log('broke here 2'))
          })
          console.log(word.toLowerCase() + ' in dictionary: ' + dictionary.isInDictionary(word.toLowerCase()))
          await serverMove.save()
          break
        case 'Scramble':
          const serverMove2 = new Move()
          serverMove2.player = player
          serverMove2.lobby = lobby
          serverMove2.moveType = MoveType.SpawnTiles
          for (let i = 0; i < 16; i++) {
            const spawnedTile = new Tile()
            spawnedTile.letter = getRandomLetter()
            spawnedTile.location = i
            spawnedTile.move = serverMove2
            spawnedTile.value = 1
            spawnedTile.tileType = TileType.Normal
            //await spawnedTile.save()
          }
          await serverMove2.save()
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
    lobbiesUpdates: {
      subscribe: (_, {}, context) => context.pubsub.asyncIterator('LOBBIES_UPDATE'),
      resolve: (payload: any) => payload,
    },
    lobbyUpdates: {
      subscribe: (_, { lobbyId }, context) => context.pubsub.asyncIterator('LOBBY_UPDATE_' + lobbyId),
      resolve: (payload: any) => payload,
    },
  },
  // Apollo requires that a GraphQL interface has this resolver to distinguish implementations
  Move: {
    __resolveType(move, context, info) {
      return move.moveType
    },
  },
  User: {
    player: (self, args, ctx) => {
      return Player.findOne({ where: { userId: self.id } }) as any
    },
  },
  Player: {
    lobby: (self, args, ctx) => {
      return Lobby.findOne({ where: { id: self.lobbyId } }) as any
    },
  },
  Lobby: {
    players: (self, args, ctx) => {
      return Player.find({ where: { lobbyId: self.id } }) as any
    },
    moves: (self, args, ctx) => {
      return Move.find({ where: { lobbyId: self.id } }) as any
    },
  },
}
