import { gql } from '@apollo/client'
import {
  DeselectTile,
  MoveInput,
  MutationMakeMoveArgs,
  Scramble,
  SelectTile,
  // eslint-disable-next-line prettier/prettier
  Submit
} from '../../../../server/src/graphql/schema.types'
import { getApolloClient } from '../../graphql/apolloClient'

const makeMoveMutation = gql`
  mutation MakeMove($input: MoveInput!) {
    makeMove(input: $input)
  }
`
interface MakeMove {
  success: boolean
}
export function submitMove(input: Submit) {
  const temp = []
  for (let i = 0; i < input.tiles.length; i++) {
    temp.push({
      letter: input.tiles[i].letter,
      pointValue: input.tiles[i].pointValue,
      tileType: input.tiles[i].tileType,
      location: input.tiles[i].location,
    })
  }
  const t: MoveInput = {
    playerId: input.player.id,
    lobbyId: input.player.lobby.id,
    time: input.time,
    moveType: input.moveType,
    tiles: temp,
    pointValue: input.pointValue,
  }
  return getApolloClient().mutate<MakeMove, MutationMakeMoveArgs>({
    mutation: makeMoveMutation,
    variables: { input: t },
  })
}
export function randomizeMove(input: Scramble) {
  const t: MoveInput = {
    playerId: input.player.id,
    lobbyId: input.player.lobby.id,
    time: input.time,
    moveType: input.moveType,
    pointValue: 0,
  }
  return getApolloClient().mutate<MakeMove, MutationMakeMoveArgs>({
    mutation: makeMoveMutation,
    variables: { input: t },
  })
}

export function selectMove(input: SelectTile) {
  const temp = []
  for (let i = 0; i < input.tiles.length; i++) {
    temp.push({
      letter: input.tiles[i].letter,
      pointValue: input.tiles[i].pointValue,
      tileType: input.tiles[i].tileType,
      location: input.tiles[i].location,
    })
  }
  const t: MoveInput = {
    playerId: input.player.id,
    lobbyId: input.player.lobby.id,
    time: input.time,
    moveType: input.moveType,
    tiles: temp,
    pointValue: 0,
  }
  return getApolloClient().mutate<MakeMove, MutationMakeMoveArgs>({
    mutation: makeMoveMutation,
    variables: { input: t },
  })
}

export function deselectMove(input: DeselectTile) {
  const temp = []
  for (let i = 0; i < input.tiles.length; i++) {
    temp.push({
      letter: input.tiles[i].letter,
      pointValue: input.tiles[i].pointValue,
      tileType: input.tiles[i].tileType,
      location: input.tiles[i].location,
    })
  }
  const t: MoveInput = {
    playerId: input.player.id,
    lobbyId: input.player.lobby.id,
    time: input.time,
    moveType: input.moveType,
    tiles: temp,
    pointValue: 0,
  }
  return getApolloClient().mutate<MakeMove, MutationMakeMoveArgs>({
    mutation: makeMoveMutation,
    variables: { input: t },
  })
}
