import { gql } from '@apollo/client'

export const fetchLobbyPage = gql`
  query FetchLobbyPage($offset: Int!) {
    lobbypage(offset: $offset) {
      id
      maxUsers
      gameTime
      state
      players {
        id
      }
    }
  }
`

export const fetchLobbies = gql`
  query FetchLobbies {
    lobbies {
      id
      maxUsers
      gameTime
      state
      players {
        id
      }
    }
  }
`

export const fetchLobby = gql`
  query FetchLobby($lobbyId: Int!) {
    lobby(lobbyId: $lobbyId) {
      id
      maxUsers
      gameTime
      state
      players {
        id
      }
    }
  }
`

export const fetchUserName = gql`
  query FetchUserName($playerId: Int!) {
    username(playerId: $playerId)
  }
`

export const fetchUser = gql`
  query FetchUser($userId: Int!) {
    user(userId: $userId) {
      id
      name
      player {
        id
        lobbyId
      }
    }
  }
`
export const subscribeLobbies = gql`
  subscription LobbiesSubscription {
    lobbiesUpdates {
      id
      maxUsers
      gameTime
      state
      players {
        id
      }
    }
  }
`

export const subscribeLobby = gql`
  subscription LobbySubscription($lobbyId: Int!) {
    lobbyUpdates(lobbyId: $lobbyId) {
      id
      maxUsers
      gameTime
      state
      players {
        id
      }
    }
  }
`
