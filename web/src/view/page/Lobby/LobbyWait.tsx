import { useQuery } from '@apollo/client'
import { RouteComponentProps } from '@reach/router'
import * as React from 'react'
import {
  FetchLobbies,
  FetchLobby,
  FetchLobbyVariables,
  FetchUser,
  FetchUserName,
  FetchUserNameVariables,
  // eslint-disable-next-line prettier/prettier
  FetchUserVariables
} from '../../../graphql/query.gen'
import { UserContext } from '../../auth/user'
import { Link_Self } from '../../nav/Link'
import { AppRouteParams, getGamePath, getLobbySearchPath } from '../../nav/route'
import { handleError } from '../../toast/error'
import { Page } from '../Page'
import { fetchLobbies, fetchLobby, fetchUser, fetchUserName } from './fetchLobbies'
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
  console.log('User ID: ' + userId)

  const { loading, data } = useQuery<FetchUser, FetchUserVariables>(fetchUser, { variables: { userId } })

  console.log('DATA: ' + JSON.stringify(data))
  console.log('PLAYER INFO: ' + JSON.stringify(data?.user?.player))
  console.log('USER ID: ' + data?.user?.id)
  console.log('USER NAME ' + data?.user?.name)
  console.log('Player ID: ' + data?.user?.player?.id)
  console.log('Lobby ID: ' + data?.user?.player?.lobbyId)

  if (loading) return <div>Loading User ...</div>
  else if (!data) return <div>Error: User was not found</div>
  else if (!data.user?.player) return <div>Error: Player was not found</div>

  return <LobbyWaitMain lobbyId={data.user.player.lobbyId ? data.user.player.lobbyId : 1}></LobbyWaitMain>

  // const {user} = React.useContext(UserContext);

  // if(user?.player == null )
  //    return <div>Error: Missing Player {user?.player}</div>

  // return <LobbyWaitMain lobbyId={user?.player.id}/>

  // const location = useLocation()
  // const [, lobbyId] = (location.search || '').split('?lobbyId=')
  // return lobbyId ? <LobbyWaitMain lobbyId={Number(lobbyId)} /> : <LobbyWaitMain lobbyId={0}/>
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
        <div className="w-50 pa3">
          <ExitButton userId={p.userId} lobbyId={p.lobbyId} />
        </div>
        <div className="w-50 pa3">
          <StartButton lobbyId={p.lobbyId} />
        </div>
      </div>
      <div className="ba h3 mb3 bg-black-10 flex items-center w-75">
        <h1 className="center">{p.lobbyName}</h1>
      </div>
    </div>
  )
}

function PlayersContainer(p: PlayersContainerProps) {
  const lobbyId = p.lobbyId
  // const [playerListLength, setPlayerListLength] = React.useState(0);
  const { loading, data, refetch } = useQuery<FetchLobby, FetchLobbyVariables>(fetchLobby, { variables: { lobbyId } })
  refetch().catch(handleError)
  if (loading) {
    return <div>Fetching Lobby</div>
  } else if (data == null) {
    return <div>Lobby not found</div>
  }

  return (
    <div className="mw8 flex ">
      <div className="w-25 ph2 flex justify-center h5 items-center bg-green">ChatBox</div>

      <div className="playerContainer outline">
        <SettingsBar maxPlayer={data?.lobby?.maxUsers} timeLimit={data?.lobby?.gameTime} />
        <div className="flex flex-column ma2">
          {data.lobby?.players.map((player, i) => (
            <Player key={i} playerId={player.id} />
          ))}
        </div>
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
  const { loading, data } = useQuery<FetchUserName, FetchUserNameVariables>(fetchUserName, { variables: { playerId } })
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
  const { refetch } = useQuery<FetchLobbies>(fetchLobbies)

  function handleStart() {
    startGame(p.lobbyId)
      .then(() => refetch())
      .catch(handleError)
  }

  return (
    <Link_Self to={getGamePath(p.lobbyId)} onClick={handleStart}>
      Start
    </Link_Self>
  )
}

function ExitButton(p: ExitButtonProps) {
  const lobbyId = p.lobbyId
  const { refetch } = useQuery<FetchLobbies>(fetchLobbies)
  const lobbyList = useQuery<FetchLobby, FetchLobbyVariables>(fetchLobby, { variables: { lobbyId } })

  function handleExit() {
    leaveLobby(p.userId)
      .then(() => refetch())
      .then(() => lobbyList.refetch())
      .catch(handleError)
  }

  return (
    <Link_Self to={getLobbySearchPath()} onClick={() => handleExit()}>
      Exit
    </Link_Self>
  )
}
