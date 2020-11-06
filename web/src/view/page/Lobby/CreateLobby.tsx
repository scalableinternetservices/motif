import { useQuery } from '@apollo/client';
import * as React from 'react';
import { getApolloClient } from '../../../graphql/apolloClient';
import { Button } from '../../../style/button';
import { H2 } from '../../../style/header';
import { style } from '../../../style/styled';
import { handleError } from '../../toast/error';
import { fetchLobbies } from './fetchLobbies';
import { FetchLobbies } from './LobbySearch';
import { createLobby } from './mutateLobbies';

export function CreateLobby()
{
  const [maxPlayers, setMax] = React.useState(0);
  const [timeLimit, setTime] = React.useState(0);

  return (
    <div className="createLobby flex">
      <div className="flex flex-column items-center">
        <H2 className="mb3">Create Lobby</H2>
        <Settings setMax={setMax} setTime={setTime} maxPlayers={maxPlayers} timeLimit={timeLimit}/>
        <CreateLobbyButton maxPlayers={maxPlayers} timeLimit={timeLimit}/>
        <ResetButton setMax={setMax} setTime={setTime} maxPlayers={maxPlayers} timeLimit={timeLimit}/>
      </div>
    </div>
  )
}

interface SettingsProps {
  setMax(num: number): void,
  setTime(num: number): void,
  maxPlayers: number,
  timeLimit: number,
}

interface DisplaySettingsProps {
  maxPlayers: number,
  timeLimit: number,
}

function Settings(p: SettingsProps)
{
  return (
    <div>
      <ChooseSettings setMax={p.setMax} setTime={p.setTime} maxPlayers={p.maxPlayers} timeLimit={p.timeLimit}/>
      <DisplaySettings maxPlayers={p.maxPlayers} timeLimit={p.timeLimit}/>
    </div>
  )
}

function ChooseSettings(p: SettingsProps)
{
  return (
    <div className="flex mb3">
          <div>
            <div className="tc mb3 mr3">
            Max Players
            </div>
            <div className="flex">
              <MR>
                <Button onClick={() => p.setMax(2)}>
                  2
                </Button>
              </MR>
              <MR>
                <Button onClick={() => p.setMax(4)}>
                  4
                </Button>
              </MR>
            </div>
          </div>
          <div>
            <div className="tc mb3 mr3">
              Time Limit
              </div>
            <div className="flex">
              <MR>
                <Button onClick={() => p.setTime(5)}>
                  5
                </Button>
              </MR>
              <div>
                <Button onClick={() => p.setTime(10)}>
                  10
                </Button>
              </div>
            </div>
          </div>
        </div>
  )
}

function DisplaySettings(p: DisplaySettingsProps)
{
  return (
    <div className="mb3 tc">
          Max Players: {p.maxPlayers} <br></br>
          Time Limit: {p.timeLimit}
    </div>
  )
}

function CreateLobbyButton(p: DisplaySettingsProps)
{
  const { loading, data, refetch } = useQuery<FetchLobbies>(fetchLobbies);
  if (loading) {
    return <div>loading...</div>
  }
  if (!data || data.lobbies.length == 0) {
    return <div>no lobbies</div>
  }

  function createNewLobby() {
    if(!data) {
      return
    }
    createLobby(getApolloClient(), 1, p.maxPlayers, p.timeLimit, true)
    .then(() => refetch())
    .catch(handleError)
  }

  return (
    <div className="mb4">
      <Button  onClick={ () => {alert("NEW LOBBY"); createNewLobby();} }>
        Create Lobby
      </Button>
    </div>
  )
}

function ResetButton(p: SettingsProps)
{
  return (
    <div className="mb4">
      <Button onClick={() => {p.setMax(0); p.setTime(0);}}>
        Reset
      </Button>
    </div>
  )
}

const MR = style('div', 'mr3')