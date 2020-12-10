import { useQuery } from '@apollo/client'
import { navigate, RouteComponentProps } from '@reach/router'
import * as React from 'react'
import { FetchLobby_lobby, FetchUserName, FetchUserNameVariables } from '../../../graphql/query.gen'
import { UserContext } from '../../auth/user'
import { Link_Self } from '../../nav/Link'
import { AppRouteParams } from '../../nav/route'
import { handleError } from '../../toast/error'
import { Page } from '../Page'
import { fetchUserName } from './fetchLobbies'
import { UserInfo } from './LobbySearch'
import { leaveLobby, startGame } from './mutateLobbies'

interface LobbyWaitProps extends RouteComponentProps, AppRouteParams, LobbyData {}

interface LobbyMainProps extends LobbyData {
  lobbyId: number
}

interface TopBarProps extends LobbyMainProps, UserInfo {
  lobbyName: string
}

interface SettingsBarProps {
  timeLimit?: number
  maxPlayer?: number
}

interface PlayerProps {
  playerId: number
}

interface LobbyData {
  lobbyId?: number
  maxTime?: number
  maxPlayers?: number
  Lobby?: FetchLobby_lobby | null
}

interface ExitButtonProps extends UserInfo, LobbyMainProps {}

export function LobbyWait(props: LobbyWaitProps) {
  return (
    <Page>
      <LobbyWaitWrap
        lobbyId={props.lobbyId}
        maxTime={props.maxTime}
        maxPlayers={props.maxPlayers}
        Lobby={props.Lobby}
      />
    </Page>
  )
}

function LobbyWaitWrap(props: LobbyData) {
  return (
    <LobbyWaitMain
      lobbyId={props.lobbyId ? props.lobbyId : -1}
      maxTime={props.maxTime}
      maxPlayers={props.maxPlayers}
      Lobby={props.Lobby}
    ></LobbyWaitMain>
  )
}

function LobbyWaitMain(props: LobbyMainProps) {
  return (
    <div className="baseCanvas">
      <LobbyContainer
        lobbyId={props.lobbyId}
        maxTime={props.maxTime}
        maxPlayers={props.maxPlayers}
        Lobby={props.Lobby}
      />
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
      <PlayersContainer lobbyId={p.lobbyId} maxPlayers={p.maxPlayers} maxTime={p.maxTime} Lobby={p.Lobby} />
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

function PlayersContainer(p: LobbyMainProps) {
  return (
    <div className="mw8 flex ">
      <div className="w-25 ph2 flex justify-center h5 items-center bg-green">ChatBox</div>

      <div className="playerContainer outline">
        <SettingsBar maxPlayer={p.maxPlayers} timeLimit={p.maxTime} />
        {p.Lobby?.id != -1 && (
          <div className="flex flex-column ma2">
            {p.Lobby?.players.map((player, i) => (
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
    fetchPolicy: 'cache-first',
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
    leaveLobby(p.userId)
      .then(() => navigate('/app/LobbySearch'))
      .catch(handleError)
  }

  return <Link_Self onClick={() => handleExit()}>Exit</Link_Self>
}
