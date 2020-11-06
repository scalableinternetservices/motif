import { RouteComponentProps } from '@reach/router';
import * as React from 'react';
import { Button } from '../../../style/button';
import { AppRouteParams } from '../../nav/route';
import { Page } from '../Page';
interface LobbyWaitProps extends RouteComponentProps, AppRouteParams {}

export function LobbyWaitMain(props: LobbyWaitProps) {
  return (
    <Page>
      <div className="baseCanvas">
        <LobbyContainer/>
      </div>
    </Page>
    );
}

function LobbyContainer() {
  //Query for lobby data here
  const lobbyName = "Insert Lobby Name Here"
  const players = [{name: "Alan"},
                   {name: "Juan"},
                   {name: "Elyse"},
                   {name: "Nihar"},]
  return (
      <div>
         <TopBar lobbyName={lobbyName}/>
         <PlayersContainer players={players}/>
      </div>
  )
}

interface TopBarProps {
  lobbyName: string,
}

function TopBar(p : TopBarProps){
  return (
    <div className="mw100-l flex">
      <div className="w-25 pa3 flex justify-around h3">
        <div className="w-50 pa3">
        <ExitButton/>
        </div>
        <div className="w-50 pa3">
        <StartButton/>
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
          <Player name={player.name}/>
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

function StartGame() {
  alert("starting GAME NOW...")
}

function StartButton() {
  return (
    <Button $color="mint" onClick={StartGame}>Start</Button>
  )
}

function ExitButton() {
  return (
    <a href="/app/LobbySearch"
         className="link black">
      <Button $color="coral">
         Exit
      </Button>
    </a>
  );
}