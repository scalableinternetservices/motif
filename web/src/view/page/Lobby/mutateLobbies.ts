import { ApolloClient, gql } from '@apollo/client'
import { MutationCreateLobbyArgs } from '../../../../../server/src/graphql/schema.types'
import { getApolloClient } from '../../../graphql/apolloClient'

const createLobbiesMutation = gql`
  mutation CreateLobby($userId: Int!, $maxUsers: Int!, $maxTime: Int!, $state: Boolean!) {
    createLobby(userId : $userId, maxUsers : $maxUsers, maxTime : $maxTime, state : $state)
  }
`

interface CreateLobby {
  lobbyID : number
}

export function createLobby(client: ApolloClient<any>, userId : number, maxUsers: number, maxTime: number, state: boolean) {
  return getApolloClient().mutate<CreateLobby, MutationCreateLobbyArgs>({
    mutation: createLobbiesMutation,
    variables: { userId, maxUsers, maxTime, state},
  })
}