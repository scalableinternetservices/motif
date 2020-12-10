import console from 'console'
import { readFileSync } from 'fs'
import { GraphQLScalarType, Kind } from 'graphql'
import { PubSub } from 'graphql-yoga'
import Redis from 'ioredis'
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

export const redis = new Redis()
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
  redis: Redis.Redis
}

//From: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cyclic_object_value
const getCircularReplacer = () => {
  const seen = new WeakSet()
  return (_key: any, value: any) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return
      }
      seen.add(value)
    }
    return value
  }
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
    activeLobbies: async (_, args, ctx) => {
      const redisRes = await ctx.redis.hvals('LOBBIES')
      if (redisRes.length != 0) {
        console.log(redisRes)
        const res: any[] = []
        redisRes.forEach(item => {
          if (item != '') {
            const lobby = JSON.parse(item)
            if (lobby.state == LobbyState.Public || lobby.state == LobbyState.Private) {
              res.push(lobby)
            }
          }
        })
        return res
      } else {
        const lobbies = await Lobby.find({ where: [{ state: LobbyState.Private }, { state: LobbyState.Public }] })
        lobbies.forEach(
          async lobby => await ctx.redis.hset('LOBBIES', `${lobby.id}`, JSON.stringify(lobby, getCircularReplacer()))
        )
        return lobbies
      }
    },
    lobbies: async (_, args, ctx) => {
      const redisRes = await ctx.redis.hvals('LOBBIES')
      if (redisRes.length != 0) {
        console.log(redisRes)
        const res: any[] = []
        redisRes.forEach(item => {
          if (item != '') res.push(JSON.parse(item))
        })
        return res
      } else {
        const lobbies = await Lobby.find()
        lobbies.forEach(async lobby => await ctx.redis.hset('LOBBIES', `${lobby.id}`, JSON.stringify(lobby)))
        return lobbies
      }
    },
    lobby: async (_, { lobbyId }, ctx) => {
      const redisRes = await ctx.redis.hget('LOBBIES', lobbyId.toString())
      if (redisRes) {
        console.log('CACHE')
        return JSON.parse(redisRes)
      } else {
        console.log('NO CACHE')
        if (lobbyId <= 0) {
          return undefined
        }
        const res = await Lobby.findOne({ where: { id: lobbyId } })
        if (res) {
          await ctx.redis.hset('LOBBIES', `${res.id}`, JSON.stringify(res))
        }
        return res
      }
    },
    user: async (_, { userId }, ctx) => {
      const redisRes = await ctx.redis.get(`USER:${userId}`)
      if (redisRes) {
        console.log('CACHE')
        const user = JSON.parse(redisRes)
        return user
      } else {
        console.log('NO CACHE')
        const user = await User.findOne({ where: { id: userId } })
        const userJSON = JSON.stringify(user, getCircularReplacer())
        await ctx.redis.set(`USER:${userId}`, userJSON)
        return user
      }
    },
    users: () => User.find(),
    username: async (_, { playerId }, ctx) => {
      const redisRes = await ctx.redis.get(`USERNAME:${playerId}`)
      if (redisRes) {
        console.log('CACHE')
        const userName = JSON.parse(redisRes)
        return userName
      } else {
        console.log('NO CACHE')
        const player = await Player.findOne({ where: { id: playerId }, relations: ['user'] })
        if (!player) {
          return undefined
        }
        const userName = player.user.name
        if (!userName) {
          return undefined
        }
        const userNameJSON = JSON.stringify(userName, getCircularReplacer())
        await ctx.redis.set(`USERNAME:${playerId}`, userNameJSON)
        return userName
      }
    },
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

        //Update a user and username in the redis cache for later query
        const userJSON = await ctx.redis.get(`USER:${userId}`)
        if (userJSON) {
          const user = JSON.parse(userJSON)
          user.player = player
          await ctx.redis.set(`USERNAME:${player.id}`, JSON.stringify(user.name, getCircularReplacer()))
          await ctx.redis.set(`USER:${userId}`, JSON.stringify(user, getCircularReplacer()))
        }

        //Save player in redis cache
        await ctx.redis.set(`PLAYERS:${userId}`, JSON.stringify(player, getCircularReplacer()))
      } else {
        //Look for old lobby first through redis cache
        const oldLobbyJSON = await ctx.redis.hget('LOBBIES', `${player.lobbyId}`)
        let oldLobby
        if (oldLobbyJSON) {
          oldLobby = JSON.parse(oldLobbyJSON)
        } else {
          oldLobby = await Lobby.findOne(player.lobbyId)
        }
        player.lobby = newLobby
        await player.save()
        //Save player in redis cache
        await ctx.redis.set(`PLAYERS:${userId}`, JSON.stringify(player, getCircularReplacer()))
        if (oldLobby) {
          console.log('LOG: Removing player from old lobby ' + oldLobby.id)
          const oldPlayers = await Player.find({ where: { lobbyId: oldLobby.id } })
          if (oldPlayers.length < 1) {
            console.log('LOG: Deleting empty lobby ' + oldLobby.id)
            if (oldLobby.state != LobbyState.InGame) {
              await ctx.redis.hdel('LOBBIES', `${oldLobby.id}`)
              await Lobby.remove(oldLobby)
            } else {
              oldLobby.state = LobbyState.Replay
              await oldLobby.save()
              await ctx.redis.hset('LOBBIES', `${oldLobby.id}`, JSON.stringify(oldLobby, getCircularReplacer()))
            }
          } else {
            // const oldLobbyJSON = await ctx.redis.hget('LOBBIES', `${oldLobby.id}`)
            // if (oldLobbyJSON) {
            //   const updatedOldLobby = JSON.parse(oldLobbyJSON)
            //   ctx.pubsub.publish('LOBBY_UPDATE_' + oldLobby.id, updatedOldLobby) //send update to old lobby
            // } else {
            //   console.log(`ERROR: Old Lobby with id:${oldLobby.id} not found in redis`)
            // }
          }
        }
      }

      await ctx.redis.hset('LOBBIES', `${newLobby.id}`, JSON.stringify(newLobby, getCircularReplacer()))

      // Get all lobbies and pass as payload for lobbiesUpdates subscripton
      const lobbiesJSON = await ctx.redis.hvals('LOBBIES')
      const lobbies: Lobby[] = []
      lobbiesJSON.forEach(item => {
        if (item != '') lobbies.push(JSON.parse(item))
      })
      ctx.pubsub.publish('LOBBIES_UPDATE', lobbies)

      //push the update to the newly joined lobby
      const lobbyJSON = await ctx.redis.hget('LOBBIES', `${newLobby.id}`)
      if (lobbyJSON) {
        const updatedLobby = JSON.parse(lobbyJSON)
        ctx.pubsub.publish('LOBBY_UPDATE_' + newLobby.id, updatedLobby)
      } else {
        console.log(`ERROR_CREATE_LOBBY: New Lobby with id:${newLobby.id} not found in redis`)
      }

      return newLobby.id
    },
    joinLobby: async (_, { userId, lobbyId }, ctx) => {
      // TODO: need to validate: remove user from current lobbies, is lobby in right state, etc
      //Try and grab newLobby from redis cache
      const newLobbyString = check(await ctx.redis.hget('LOBBIES', `${lobbyId}`))
      const newLobby = JSON.parse(newLobbyString)
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
        await ctx.redis.set(`PLAYERS:${userId}`, JSON.stringify(player, getCircularReplacer()))
      } else {
        const oldLobbyString = await ctx.redis.hget('LOBBIES', `${player.lobbyId}`)
        let oldLobby
        if (oldLobbyString) {
          oldLobby = JSON.parse(oldLobbyString)
        } else {
          oldLobby = await Lobby.findOne(player.lobbyId)
        }
        player.lobby = newLobby
        await player.save()
        await ctx.redis.set(`PLAYERS:${userId}`, JSON.stringify(player, getCircularReplacer()))

        // if player exists already, check to see if old lobbies need to be cleaned up
        if (oldLobby) {
          console.log('LOG: Removing player from old lobby ' + oldLobby.id)
          const oldPlayers = await Player.find({ where: { lobbyId: oldLobby.id } })
          if (oldPlayers.length < 1) {
            console.log('LOG: Deleting empty lobby ' + oldLobby.id)
            if (oldLobby.state != LobbyState.InGame) {
              await ctx.redis.hdel('LOBBIES', `${oldLobby.id}`)
              await Lobby.remove(oldLobby)
            } else {
              oldLobby.state = LobbyState.Replay
              await oldLobby.save()
              await ctx.redis.hset('LOBBIES', `${oldLobby.id}`, JSON.stringify(oldLobby, getCircularReplacer()))
            }
          } else {
            const oldLobbyJSON = await ctx.redis.hget('LOBBIES', `${oldLobby.id}`)
            if (oldLobbyJSON) {
              const updatedOldLobby = JSON.parse(oldLobbyJSON)
              ctx.pubsub.publish('LOBBY_UPDATE_' + oldLobby.id, updatedOldLobby) //send update to old lobby
            } else {
              console.log(`ERROR: Old Lobby with id:${oldLobby.id} not found in redis`)
            } //send update to old lobby
          }
        }
      }

      //Save updates to user and lobbies in redis
      //Update a user and username in the redis cache for later query
      const userJSON = await ctx.redis.get(`USER:${userId}`)
      if (userJSON) {
        const user = JSON.parse(userJSON)
        user.player = player
        await ctx.redis.set(`USERNAME:${player.id}`, JSON.stringify(user.name, getCircularReplacer()))
        await ctx.redis.set(`USER:${userId}`, JSON.stringify(user, getCircularReplacer()))
      }

      await ctx.redis.hset(`LOBBIES`, `${newLobby.id}`, JSON.stringify(newLobby, getCircularReplacer()))

      //get all lobbies from redis and pass as payload for lobbiesUpdates sub
      const lobbiesJSON = await ctx.redis.hvals('LOBBIES')
      const lobbies: Lobby[] = []
      lobbiesJSON.forEach(item => {
        if (item != '') lobbies.push(JSON.parse(item))
      })
      ctx.pubsub.publish('LOBBIES_UPDATE', lobbies)

      //push the update to the newly joined lobby
      const lobbyJSON = await ctx.redis.hget('LOBBIES', `${newLobby.id}`)
      if (lobbyJSON) {
        const updatedLobby = JSON.parse(lobbyJSON)
        ctx.pubsub.publish('LOBBY_UPDATE_' + newLobby.id, updatedLobby)
      } else {
        console.log(`ERROR: New Lobby with id:${newLobby.id} not found in redis`)
      }

      return true
    },
    leaveLobby: async (_, { userId }, ctx) => {
      //Try to grab player from redis cache
      const playerJSON = check(await ctx.redis.get(`PLAYERS:${userId}`))
      let player
      if (playerJSON) {
        player = JSON.parse(playerJSON)
      } else {
        player = check(await Player.findOne({ where: { userId: userId } }))
        await ctx.redis.set(`PLAYERS:${userId}`, JSON.stringify(player, getCircularReplacer()))
      }
      const lobby = await Lobby.findOne(player.lobbyId)

      if (!lobby) return false

      const players = await Player.find({ where: { lobbyId: lobby.id } })
      if (players.length <= 1) {
        console.log('LOG: Deleting empty lobby ' + lobby.id)
        // delete lobbies that have not started
        if (lobby.state != LobbyState.InGame) {
          await ctx.redis.hdel('LOBBIES', `${lobby.id}`)
          await Lobby.remove(lobby)
        } else {
          lobby.state = LobbyState.Replay
          await lobby.save()
          await ctx.redis.hset('LOBBIES', `${lobby.id}`, JSON.stringify(lobby, getCircularReplacer()))
        }
      } else {
        const lobbyJSON = await ctx.redis.hget('LOBBIES', `${lobby.id}`)
        if (lobbyJSON) {
          const updatedLobby = JSON.parse(lobbyJSON)
          ctx.pubsub.publish('LOBBY_UPDATE_' + lobby.id, updatedLobby)
        } else {
          console.log(`ERROR_JOIN_LOBBY: New Lobby with id:${lobby.id} not found in redis`)
        }
      }

      await ctx.redis.del(`USERNAME:${player.id}`)
      // delete as Player, since user no longer in any lobbies
      await Player.remove(player)
      //Update a user and username in the redis cache for later query
      const userJSON = await ctx.redis.get(`USER:${userId}`)
      if (userJSON) {
        const user = JSON.parse(userJSON)
        user.player = null
        await ctx.redis.set(`USER:${userId}`, JSON.stringify(user, getCircularReplacer()))
      }
      //Update lobby search page with pubsub and redis cache
      const lobbiesJSON = await ctx.redis.hvals('LOBBIES')
      const lobbies: Lobby[] = []
      lobbiesJSON.forEach(item => {
        if (item != '') lobbies.push(JSON.parse(item))
      })
      ctx.pubsub.publish('LOBBIES_UPDATE', lobbies)

      //No need to update the subscribers of the lobby if the lobby is removed
      if (players.length > 1) {
        const lobbyJSON = await ctx.redis.hget('LOBBIES', `${lobby.id}`)
        if (lobbyJSON) {
          const updatedLobby = JSON.parse(lobbyJSON)
          ctx.pubsub.publish('LOBBY_UPDATE_' + lobby.id, updatedLobby)
        } else {
          console.log(`ERROR_LEAVE__LOBBY: New Lobby with id:${lobby.id} not found in redis`)
        }
      }

      return true
    },
    startGame: async (_, { lobbyId }, ctx) => {
      // TODO take player param and check if in lobby
      const lobby = check(await Lobby.findOne({ where: { id: lobbyId } }))
      if (lobby.state != LobbyState.Private && lobby.state != LobbyState.Public) return false
      lobby.state = LobbyState.InGame
      lobby.startTime = new Date()
      await lobby.save()
      //Update the redis cache with the started lobby
      await ctx.redis.hset(`LOBBIES`, `${lobby.id}`, JSON.stringify(lobby, getCircularReplacer()))

      //Update lobby search page with pubsub and redis cache
      const lobbiesJSON = await ctx.redis.hvals('LOBBIES')
      const lobbies: Lobby[] = []
      lobbiesJSON.forEach(item => {
        if (item != '') lobbies.push(JSON.parse(item))
      })
      ctx.pubsub.publish('LOBBIES_UPDATE', lobbies)

      //push the update to the started lobby
      const lobbyJSON = await ctx.redis.hget('LOBBIES', `${lobby.id}`)
      if (lobbyJSON) {
        const updatedLobby = JSON.parse(lobbyJSON)
        ctx.pubsub.publish('LOBBY_UPDATE_' + lobby.id, updatedLobby)
      } else {
        console.log(`ERROR_START_GAME: New Lobby with id:${lobby.id} not found in redis`)
      }

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
