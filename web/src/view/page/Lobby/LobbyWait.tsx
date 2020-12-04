import { useQuery, useSubscription } from '@apollo/client'
import { RouteComponentProps } from '@reach/router'
import * as React from 'react'
import {
  FetchLobby,
  FetchLobbyVariables,
  FetchUser,
  FetchUserName,
  FetchUserNameVariables,
  FetchUserVariables,
  LobbySubscription,
  // eslint-disable-next-line prettier/prettier
  LobbySubscriptionVariables
} from '../../../graphql/query.gen'
import { UserContext } from '../../auth/user'
import { Link_Self } from '../../nav/Link'
import { AppRouteParams, getLobbySearchPath } from '../../nav/route'
import { handleError } from '../../toast/error'
import { Page } from '../Page'
import { fetchLobby, fetchUser, fetchUserName, subscribeLobby } from './fetchLobbies'
import { UserInfo } from './LobbySearch'
import { leaveLobby, startGame } from './mutateLobbies'

interface LobbyWaitProps extends RouteComponentProps, AppRouteParams {}

interface LobbyMainProps {
  lobbyId: number
}

interface TopBarProps extends LobbyMainProps, UserInfo {
  lobbyName: string
}

interface PlayersContainerProps {
  lobbyId: number
}

interface SettingsBarProps {
  timeLimit: number | undefined
  maxPlayer: number | undefined
}

interface PlayerProps {
  playerId: number
}

interface ExitButtonProps extends UserInfo, LobbyMainProps {}

export function LobbyWait(p: LobbyWaitProps) {
  return (
    <Page>
      <LobbyWaitWrap />
    </Page>
  )
}

function LobbyWaitWrap() {
  const { user } = React.useContext(UserContext)

  if (!user) return <div>Error: User was not found (USER CONTEXT)</div>

  const userId = user?.id
  //console.log('User ID: ' + userId)

  const { loading, data } = useQuery<FetchUser, FetchUserVariables>(fetchUser, {
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

  //console.log('DATA: ' + JSON.stringify(data))

  if (loading) return <div>Loading User ...</div>
  else if (!data) return <div>Error: User was not found</div>
  else if (!data.user?.player) return <div>Error: Player was not found</div>

  return <LobbyWaitMain lobbyId={userData?.player?.lobbyId ? userData?.player?.lobbyId : -1}></LobbyWaitMain>
}

function LobbyWaitMain(props: LobbyMainProps) {
  return (
    <div className="baseCanvas">
      <LobbyContainer lobbyId={props.lobbyId} />
    </div>
  )
}

function LobbyContainer(p: LobbyMainProps) {
  const { user } = React.useContext(UserContext)

  if (user == null) {
    return <div>User not found. Sign up as a user.</div>
  }

  const lobbyName = 'Insert Lobby Name Here'

  return (
    <div>
      <TopBar userId={user.id} lobbyId={p.lobbyId} lobbyName={lobbyName} />
      <PlayersContainer lobbyId={p.lobbyId} />
    </div>
  )
}

function TopBar(p: TopBarProps) {
  return (
    <div className="mw100-l flex">
      <div className="w-25 pa3 flex justify-around h3">
        <div className="w-50 pa3">{p.lobbyId != -1 && <ExitButton userId={p.userId} lobbyId={p.lobbyId} />}</div>
        <div className="w-50 pa3">{p.lobbyId != -1 && <StartButton lobbyId={p.lobbyId} />}</div>
      </div>
      <div className="ba h3 mb3 bg-black-10 flex items-center w-75">
        <h1 className="center">{p.lobbyName}</h1>
      </div>
    </div>
  )
}

function PlayersContainer(p: PlayersContainerProps) {
  const lobbyId = p.lobbyId

  const { loading, data } = useQuery<FetchLobby, FetchLobbyVariables>(fetchLobby, {
    variables: { lobbyId },
    fetchPolicy: 'cache-and-network',
    //pollInterval: 5000, //Comment out when using subscription
  })

  //Give each component of the Lobby its own state (so they can be updated individually)
  const [playerList, setPlayerList] = React.useState(data?.lobby?.players)
  const [maxTime, setMaxTime] = React.useState(data?.lobby?.gameTime)
  const [maxPlayers, setMaxPlayers] = React.useState(data?.lobby?.maxUsers)

  //Ensure that all lobby data displayed to the user updates when data updates
  // eg. when the query returns newer data from the db
  React.useEffect(() => {
    if (data?.lobby) {
      setPlayerList(data.lobby.players)
      setMaxTime(data.lobby.gameTime)
      setMaxPlayers(data.lobby.maxUsers)
    }
  }, [data])

  //Subscribe to this lobby and receive updates when a player joins or leaves
  const lobbySub = useSubscription<LobbySubscription, LobbySubscriptionVariables>(subscribeLobby, {
    variables: { lobbyId },
  })

  //Ensure that the new data sent from the server to the client updates the state and gets re-rendered
  React.useEffect(() => {
    if (lobbySub.data?.lobbyUpdates) {
      setPlayerList(lobbySub.data.lobbyUpdates.players)
    }
  }, [lobbySub.data])

  if (lobbyId != -1) {
    if (loading) {
      return <div>Fetching Lobby</div>
    } else if (data == null) {
      return <div>Lobby not found</div>
    }
  }

  return (
    <div className="mw8 flex ">
      <div className="w-25 ph2 flex justify-center h5 items-center bg-green">ChatBox</div>

      <div className="playerContainer outline">
        <SettingsBar maxPlayer={maxPlayers} timeLimit={maxTime} />
        {lobbyId != -1 && (
          <div className="flex flex-column ma2">
            {playerList?.map((player, i) => (
              <Player key={i} playerId={player.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function SettingsBar(p: SettingsBarProps) {
  return (
    <div className="settingsBar">
      <div className="flex">
        <div className="w-25 pa2">MaxPlayers: {p.maxPlayer}</div>
        <div className="w-50" />
        <div className="w-25 pa2">Time Limit: {p.timeLimit} min</div>
      </div>
    </div>
  )
}

function Player(p: PlayerProps) {
  const playerId = p.playerId
  const { loading, data } = useQuery<FetchUserName, FetchUserNameVariables>(fetchUserName, {
    variables: { playerId },
    fetchPolicy: 'cache-and-network',
  })
  let playerName
  if (loading) {
    playerName = 'Loading Player Name'
  } else if (data == null) {
    playerName = 'Player Name Not Found'
  } else {
    playerName = data.username
  }

  return <div className="player mb2 ">{playerName}</div>
}

function StartButton(p: LobbyMainProps) {
  function handleStart() {
    startGame(p.lobbyId).catch(handleError)
  }

  return <Link_Self onClick={handleStart}>Start</Link_Self>
}

function ExitButton(p: ExitButtonProps) {
  function handleExit() {
    leaveLobby(p.userId).catch(handleError)
  }

  return (
    <Link_Self to={getLobbySearchPath()} onClick={() => handleExit()}>
      Exit
    </Link_Self>
  )
}
