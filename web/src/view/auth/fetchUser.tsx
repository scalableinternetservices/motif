import { gql } from '@apollo/client'

export interface FetchUsers_users {
  id: number,
}
export interface FetchUsers {
  users: FetchUsers_users[],
}

export const fetchUser = gql`
  query FetchUserContext {
    self {
      id
      name
      userType
      player {
        id
        lobby {
          id
        }
      }
    }
  }
`
export const fetchUserList = gql`
  query FetchUserList {
    users {
      id
    }
  }
`