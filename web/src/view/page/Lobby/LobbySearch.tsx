import { RouteComponentProps } from '@reach/router';
import * as React from 'react';
import { Button } from '../../../style/button';
import { Input } from '../../../style/input';
import { style } from '../../../style/styled';
import { AppRouteParams } from '../../nav/route';
import { Page } from '../Page';
import { CreateLobby } from './CreateLobby';

interface LobbySearchProps extends RouteComponentProps, AppRouteParams {}


export function LobbySearchMain(props: LobbySearchProps) {
  return (
    <Page>
      <Content>
        <LContent>
          <div className="baseCanvas">
            <LobbyContainer/>
          </div>
        </LContent>
        <RContent>
          <CreateLobby/>
        </RContent>
      </Content>
    </Page>
    );
}

function LobbyContainer() {
  return (

        <div className="mw6">
          <div className="ba h3 mb3 bg-black-10 flex items-center">
             <h1 className="center">Lobbies</h1>
          </div>
          <LobbyList/>
        </div>

  )
}

interface LobbyButtonProps {
  active: boolean,
}


function LobbyButton(p : LobbyButtonProps) {
  return (
          <div className={p.active ? "o-100" : "o-50"}>
            <Button $color="mint" onClick={ () => alert("joining lobby")}>
              Join
              </Button>
          </div>
  )
}

interface LobbyEntryProps {
  name: string,
  maxPlayers: number,
  curPlayers: number,
  active : boolean,
}

function LobbyEntry(p : LobbyEntryProps) {
  return (
      <div className="cf pa2-ns">
        <div className="ba fl w-100 w-50-ns pa2">
          {p.name}
        </div>
        <div className="ba fl w-100 w-25-ns pa2">
          {""+p.curPlayers+"/"+p.maxPlayers}
        </div>
        <div className="ba fl w-100 w-25-ns pa2">
          <LobbyButton active={p.active}/>
        </div>
      </div>
  );
}



function LobbyList() {
  //let [lobbies, setLobbies] =  React.useState([]);
  const [field, setField] = React.useState("");

  /*
  Do some query for the available lobbies
  */

  //Currently a substitute for querying a list of lobbies
  const tempLobbyList = [
    {name : "Lobby1", maxPlayers: 4, curPlayers:2, active : true},
    {name : "Lobby2", maxPlayers: 6, curPlayers:5, active : true},
    {name : "Lobby3", maxPlayers: 2, curPlayers:2, active : false},
    {name : "Lobby4", maxPlayers: 4, curPlayers:3, active : true},
  ];

  return (
    <div>
      <div className="flex justify-center">
        <Input  placeholder="Search..." $onChange={setField}>
                </Input>
        </div>
      {tempLobbyList
      .filter(lobby => lobby.name.toLocaleLowerCase().includes(field.toLowerCase()))
      .map((lobby, i) => (
      <div key={i}>
        <LobbyEntry name={lobby.name} maxPlayers={lobby.maxPlayers}
                    curPlayers={lobby.curPlayers} active={lobby.active}
          />
      </div>))}
    </div>
  );
}



const LContent = style('div', 'flex-grow-0 w-70-l ')
const RContent = style('div', 'flex-grow-0  w-30-l')
const Content = style('div', 'flex-l')
