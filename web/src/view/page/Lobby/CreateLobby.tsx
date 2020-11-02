import * as React from 'react';
import { Button } from '../../../style/button';
import { H2 } from '../../../style/header';
import { style } from '../../../style/styled';


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
        <ResetButton setMax={setMax} setTime={setTime}/>
      </div>
    </div>
  )
}

interface SettingsProps {
  setMax(num: number): void,
  setTime(num: number): void,
  maxPlayers?: number,
  timeLimit?: number,
}

interface DisplaySettingsProps {
  maxPlayers?: number,
  timeLimit?: number,
}

function Settings(p: SettingsProps)
{
  return (
    <div>
      <ChooseSettings setMax={p.setMax} setTime={p.setTime}/>
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
  return (
    <div className="mb4">
      <Button  onClick={() => alert("Creating Lobby Max Players: " + p.maxPlayers + ", Time Limit: " + p.timeLimit)}>
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