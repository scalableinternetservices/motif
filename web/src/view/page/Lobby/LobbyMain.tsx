import { useQuery, useSubscription } from '@apollo/client'
import { RouteComponentProps } from '@reach/router'
import * as React from 'react'
import {
  FetchLobby,
  FetchLobbyVariables,
  FetchUser,
  FetchUserVariables,
  LobbyState,
  LobbySubscription,
  // eslint-disable-next-line prettier/prettier
  LobbySubscriptionVariables
} from '../../../graphql/query.gen'
import { UserContext } from '../../auth/user'
import { AppRouteParams } from '../../nav/route'
import { BoardPage } from '../BoardPage'
import { Page } from '../Page'
import { fetchLobby, fetchUser, subscribeLobby } from './fetchLobbies'
import { LobbyWait } from './LobbyWait'

interface LobbyMainProps extends RouteComponentProps, AppRouteParams {
  state?: LobbyState
}

export function LobbyMain(props: LobbyMainProps) {
  return <Page>{LobbyController()}</Page>
}

function LobbyController() {
  const { user } = React.useContext(UserContext)

  if (!user) return <div>Error: User was not found (USER CONTEXT)</div>

  const userId = user?.id

  //$POLL: (Un)Comment the pollInterval field to enable polling for this query
  const { data } = useQuery<FetchUser, FetchUserVariables>(fetchUser, {
    variables: { userId },
    fetchPolicy: 'cache-and-network',
    //pollInterval: 5000, //Comment out when using subscription
  })

  const [userData, setUserData] = React.useState(data?.user)

  React.useEffect(() => {
    if (data?.user) {
      setUserData(data.user)
    }
  }, [data])

  //$POLL: (Un)Comment the pollInterval field to enable polling for this query
  const lobbyId = userData?.player?.lobbyId ? userData.player.lobbyId : 0
  const lobby = useQuery<FetchLobby, FetchLobbyVariables>(fetchLobby, {
    variables: { lobbyId },
    fetchPolicy: 'cache-and-network',
    //pollInterval: 5000, //Comment out when using subscription
  })

  const [maxTime, setMaxTime] = React.useState(lobby.data?.lobby?.gameTime)
  const [maxPlayers, setMaxPlayers] = React.useState(lobby.data?.lobby?.maxUsers)
  const [state, setState] = React.useState(lobby.data?.lobby?.state)
  React.useEffect(() => {
    if (lobby.data) {
      setState(lobby.data.lobby?.state)
      setMaxTime(lobby.data.lobby?.gameTime)
      setMaxPlayers(lobby.data.lobby?.maxUsers)
    }
  }, [lobby.data])

  //$SUB: (Un)Comment lobbySub and the associated useEffect below
  //Subscribe to this lobby and receive updates when a player joins or leaves
  const lobbySub = useSubscription<LobbySubscription, LobbySubscriptionVariables>(subscribeLobby, {
    variables: { lobbyId },
  })
  //Ensure that the new data sent from the server to the client updates the state and gets re-rendered
  React.useEffect(() => {
    if (lobbySub.data?.lobbyUpdates) {
      setState(lobbySub.data.lobbyUpdates.state)
      setMaxTime(lobbySub.data.lobbyUpdates.gameTime)
      setMaxPlayers(lobbySub.data.lobbyUpdates.maxUsers)
    }
  }, [lobbySub.data])

  //if (loading) return <div>Loading User ...</div>
  if (!data) return <div>Error: User was not found</div>

  if (!state) {
    return <div>Error: lobby state is undefined</div>
  }

  switch (state) {
    case LobbyState.IN_GAME:
      return (
        <BoardPage
          lobbyId={lobbyId}
          playerId={userData?.player?.id ? userData.player.id : 0}
          timeLimit={maxTime}
          maxUsers={maxPlayers}
        />
      )
    case LobbyState.PRIVATE:
      return <LobbyWait lobbyId={lobbyId} maxPlayers={maxPlayers} maxTime={maxTime} />
    case LobbyState.PUBLIC:
      return <LobbyWait lobbyId={lobbyId} maxPlayers={maxPlayers} maxTime={maxTime} />
    default:
      return <div>Error: Unknown Lobby State</div>
  }
}
