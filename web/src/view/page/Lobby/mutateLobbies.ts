import { gql } from '@apollo/client'
import {
  MutationCreateLobbyArgs,
  MutationJoinLobbyArgs,
  MutationLeaveLobbyArgs,
  // eslint-disable-next-line prettier/prettier
  MutationStartGameArgs
} from '../../../../../server/src/graphql/schema.types'
import { getApolloClient } from '../../../graphql/apolloClient'

const createLobbiesMutation = gql`
  mutation CreateLobby($userId: Int!, $maxUsers: Int!, $maxTime: Int!, $state: Boolean!) {
    createLobby(userId: $userId, maxUsers: $maxUsers, maxTime: $maxTime, state: $state)
  }
`

const startGameMutation = gql`
  mutation StartGame($lobbyId: Int!) {
    startGame(lobbyId: $lobbyId)
  }
`

const joinLobbyMutation = gql`
  mutation JoinLobby($userId: Int!, $lobbyId: Int!) {
    joinLobby(userId: $userId, lobbyId: $lobbyId)
  }
`

const leaveLobbyMutation = gql`
  mutation LeaveLobby($userId: Int!) {
    leaveLobby(userId: $userId)
  }
`

interface CreateLobby {
  lobbyID: number
}

export function createLobby(userId: number, maxUsers: number, maxTime: number, state: boolean) {
  return getApolloClient().mutate<CreateLobby, MutationCreateLobbyArgs>({
    mutation: createLobbiesMutation,
    variables: { userId, maxUsers, maxTime, state },
  })
}

interface StartGame {
  success: boolean
}

export function startGame(lobbyId: number) {
  return getApolloClient().mutate<StartGame, MutationStartGameArgs>({
    mutation: startGameMutation,
    variables: { lobbyId },
  })
}

interface JoinGame {
  success: boolean
}

export function joinLobby(userId: number, lobbyId: number) {
  return getApolloClient().mutate<JoinGame, MutationJoinLobbyArgs>({
    mutation: joinLobbyMutation,
    variables: { userId, lobbyId },
  })
}

interface LeaveLobby {
  success: boolean
}

export function leaveLobby(userId: number) {
  return getApolloClient().mutate<LeaveLobby, MutationLeaveLobbyArgs>({
    mutation: leaveLobbyMutation,
    variables: { userId },
  })
}
