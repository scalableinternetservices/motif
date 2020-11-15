import { gql } from '@apollo/client'

export const fetchLobbies = gql`
  query FetchLobbies {
    lobbies {
      id
      maxUsers
      gameTime
      players {
        id
      }
    }
  }
`

export const fetchLobby = gql`
  query FetchLobby($lobbyId: Int!){
    lobby(lobbyId: $lobbyId) {
      gameTime
      maxUsers
      players {
        id
      }
    }
  }
`

export const fetchUserName = gql`
  query FetchUserName ($playerId: Int!) {
    username(playerId: $playerId)
  }
`
