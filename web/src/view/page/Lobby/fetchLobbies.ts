import { gql } from '@apollo/client'

export const fetchLobbies = gql`
  query FetchLobbies {
    lobbies {
      id
    }
  }
`
