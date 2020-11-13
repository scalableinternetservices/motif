import { RouteComponentProps, useLocation } from '@reach/router';
import * as React from 'react';
import { UserContext } from '../../auth/user';
import { Link } from '../../nav/Link';
import { AppRouteParams, getGamePath, getLobbySearchPath } from '../../nav/route';
import { handleError } from '../../toast/error';
import { Page } from '../Page';
import { UserInfo } from './LobbySearch';
import { leaveLobby, startGame } from './mutateLobbies';

interface LobbyWaitProps extends RouteComponentProps, AppRouteParams {
}

export function LobbyWait(p: LobbyWaitProps) {
  return (
    <Page>
      <LobbyWaitWrap/>
    </Page>
  )
}

 function LobbyWaitWrap() {
  const location = useLocation()
  const [, lobbyId] = (location.search || '').split('?lobbyId=')
  return lobbyId ? <LobbyWaitMain lobbyId={Number(lobbyId)} /> : <LobbyWaitMain lobbyId={0}/>
}


interface LobbyMainProps {
  lobbyId: number,
}

 function LobbyWaitMain(props: LobbyMainProps) {
  return (
      <div className="baseCanvas">
        <LobbyContainer lobbyId={props.lobbyId}/>
      </div>
    );
}


function LobbyContainer(p: LobbyMainProps) {
  const {user} = React.useContext(UserContext);

  if(user == null) {
    return (
      <div>
         User not found. Sign up as a user.
      </div>
    )
  }

  //Query for lobby data here
  const lobbyName = "Insert Lobby Name Here"
  const players = [{name: "Alan"},
                   {name: "Juan"},
                   {name: "Elyse"},
                   {name: "Nihar"},]
  return (
      <div>
         <TopBar userId={user.id} lobbyId={p.lobbyId} lobbyName={lobbyName}/>
         <PlayersContainer players={players}/>
      </div>
  )
}

interface TopBarProps extends LobbyMainProps, UserInfo {
  lobbyName: string,
}

function TopBar(p : TopBarProps){
  return (
    <div className="mw100-l flex">
      <div className="w-25 pa3 flex justify-around h3">
        <div className="w-50 pa3">
        <ExitButton userId={p.userId}/>
        </div>
        <div className="w-50 pa3">
        <StartButton lobbyId={p.lobbyId}/>
        </div>
      </div>
      <div className="ba h3 mb3 bg-black-10 flex items-center w-75">
        <h1 className="center">{p.lobbyName}</h1>
      </div>
    </div>
  )
}

interface PlayersContainerProps {
  players : {name : string}[],
}

function PlayersContainer(p : PlayersContainerProps)
{
  return (
    <div className="mw8 flex ">
      <div className="w-25 ph2 flex justify-center h5 items-center bg-green">
        ChatBox
      </div>

      <div className="playerContainer outline">
        <SettingsBar maxPlayer={4} timeLimit={5}/>
        <div className="flex flex-column ma2">
        {p.players.map((player, i) => (
          <Player key={i} name={player.name}/>
        ))}
        </div>

      </div>
    </div>
  )
}

interface SettingsBarProps {
  timeLimit : number,
  maxPlayer : number,

}

function SettingsBar(p : SettingsBarProps) {
  return (
    <div className="settingsBar">
      <div className="flex">
        <div className="w-25 pa2">
        MaxPlayers: {p.maxPlayer}
        </div>
        <div className="w-50"/>
        <div className="w-25 pa2">
        Time Limit: {p.timeLimit} min
        </div>
      </div>
    </div>
  )
}

interface PlayerProps {
  name: string,
}

function Player(p : PlayerProps) {
  return(
    <div className="player mb2 ">
      {p.name}
    </div>
  )
}


function StartButton(p: LobbyMainProps) {

  function handleStart()
  {
    startGame(p.lobbyId)
    .catch(handleError)
  }

  return (
    <Link to={getGamePath(p.lobbyId)} onClick={handleStart}>Start</Link>
  )
}

function ExitButton(p: UserInfo) {

  function handleExit(){
    leaveLobby(p.userId)
    .catch(handleError)
  }

  return (
    <Link to={getLobbySearchPath()} onClick={() => handleExit()}>
      Exit
    </Link>
  );
}