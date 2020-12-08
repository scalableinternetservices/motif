import { readFileSync } from 'fs'
import { GraphQLScalarType, Kind } from 'graphql'
import { PubSub } from 'graphql-yoga'
import path from 'path'
import { getRandomLetter } from '../../../common/src/gameUtils'
import { check } from '../../../common/src/util'
import { Lobby } from '../entities/Lobby'
import { Move } from '../entities/Move'
import { Player } from '../entities/Player'
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
    self: (_, args, ctx) => ctx.user,
    lobbies: () => Lobby.find(),
    lobby: async (_, { lobbyId }) => (await Lobby.findOne({ where: { id: lobbyId } })) || null,
    user: async (_, { userId }) => (await User.findOne({ where: { id: userId } })) || null,
    users: () => User.find(),
    username: async (_, { playerId }) =>
      (await Player.findOne({ where: { id: playerId }, relations: ['user'] }))?.user?.name || null,
  },
  Mutation: {
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

      //Get all lobbies and pass as payload for lobbiesUpdates subscripton
      const lobbies = check(await Lobby.find())
      ctx.pubsub.publish('LOBBIES_UPDATE', lobbies)

      if (oldLobby) {
        const updatedOldLobby = check(await Lobby.findOne({ where: { id: oldLobby.id } }))
        ctx.pubsub.publish('LOBBY_UPDATE_' + oldLobby.id, updatedOldLobby) //send update to old lobby
      }
      const updatedLobby = check(await Lobby.findOne({ where: { id: newLobby.id } }))
      ctx.pubsub.publish('LOBBY_UPDATE_' + newLobby.id, updatedLobby)

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

      //Get all lobbies and pass as payload for lobbiesUpdates subscripton
      const lobbies = check(await Lobby.find())
      ctx.pubsub.publish('LOBBIES_UPDATE', lobbies)

      //pass the current updated lobby as payload for lobbyUpdates subscription
      //Joining from an old Lobby really shouldn't be a case as long as the nav bar is updated
      // to prevent jumping from a lobby waiting room to the search page
      if (oldLobby) {
        const updatedOldLobby = check(await Lobby.findOne({ where: { id: oldLobby.id } }))
        ctx.pubsub.publish('LOBBY_UPDATE_' + oldLobby.id, updatedOldLobby) //send update to old lobby
      }
      const updatedNewLobby = check(await Lobby.findOne({ where: { id: newLobby.id } }))
      ctx.pubsub.publish('LOBBY_UPDATE_' + newLobby.id, updatedNewLobby) //send update to new lobby

      return true
    },
    leaveLobby: async (_, { userId }, ctx) => {
      const player = check(await Player.findOne({ where: { userId: userId }, relations: ['user', 'lobby'] }))
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

      //Get all lobbies and pass as payload for lobbiesUpdates subscripton
      const lobbies = check(await Lobby.find())
      ctx.pubsub.publish('LOBBIES_UPDATE', lobbies)

      //No need to update the subscribers of the lobby if the lobby is removed
      if (lobby.players.length > 1) {
        const updatedLobby = check(await Lobby.findOne({ where: { id: lobby.id } }))

        //pass the current updated lobby as payload for lobbyUpdates subscription
        ctx.pubsub.publish('LOBBY_UPDATE_' + lobby.id, updatedLobby)
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

      //Get all lobbies and pass as payload for lobbiesUpdates subscripton
      const lobbies = check(await Lobby.find())
      ctx.pubsub.publish('LOBBIES_UPDATE', lobbies)

      //pass the current updated lobby as payload for lobbyUpdates subscription
      const updatedLobby = check(await Lobby.findOne({ where: { id: lobby.id } }))
      ctx.pubsub.publish('LOBBY_UPDATE_' + lobby.id, updatedLobby)

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
}
