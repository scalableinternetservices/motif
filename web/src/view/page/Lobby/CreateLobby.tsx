import * as React from 'react'
import { Button } from '../../../style/button'
import { H2 } from '../../../style/header'
import { style } from '../../../style/styled'
import { UserContext } from '../../auth/user'
import { Link_Self } from '../../nav/Link'
import { getLobbyMainPath } from '../../nav/route'
import { handleError } from '../../toast/error'
import { UserInfo } from './LobbySearch'
import { createLobby } from './mutateLobbies'

export function CreateLobby() {
  const { user } = React.useContext(UserContext)
  const [maxPlayers, setMax] = React.useState(0)
  const [timeLimit, setTime] = React.useState(0)

  if (user == null) {
    return <div>User not found. Sign up as a user.</div>
  }

  return (
    <div className="createLobby flex">
      <div className="flex flex-column items-center">
        <H2 className="mb3">Create Lobby</H2>
        <Settings userId={user.id} setMax={setMax} setTime={setTime} maxPlayers={maxPlayers} timeLimit={timeLimit} />
        <CreateLobbyButton userId={user?.id} maxPlayers={maxPlayers} timeLimit={timeLimit} />
        <ResetButton userId={user.id} setMax={setMax} setTime={setTime} maxPlayers={maxPlayers} timeLimit={timeLimit} />
      </div>
    </div>
  )
}

interface SettingsProps extends UserInfo {
  setMax(num: number): void
  setTime(num: number): void
  maxPlayers: number
  timeLimit: number
}

interface DisplaySettingsProps extends UserInfo {
  maxPlayers: number
  timeLimit: number
}

interface ChooseSettingsProps {
  setMax(num: number): void
  setTime(num: number): void
}

function Settings(p: SettingsProps) {
  return (
    <div>
      <ChooseSettings setMax={p.setMax} setTime={p.setTime} />
      <DisplaySettings userId={p.userId} maxPlayers={p.maxPlayers} timeLimit={p.timeLimit} />
    </div>
  )
}

function ChooseSettings(p: ChooseSettingsProps) {
  return (
    <div className="flex mb3">
      <div>
        <div className="tc mb3 mr3">Max Players</div>
        <div className="flex">
          <MR>
            <Button onClick={() => p.setMax(2)}>2</Button>
          </MR>
          <MR>
            <Button onClick={() => p.setMax(4)}>4</Button>
          </MR>
        </div>
      </div>
      <div>
        <div className="tc mb3 mr3">Time Limit</div>
        <div className="flex">
          <MR>
            <Button onClick={() => p.setTime(5)}>5</Button>
          </MR>
          <div>
            <Button onClick={() => p.setTime(10)}>10</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function DisplaySettings(p: DisplaySettingsProps) {
  return (
    <div className="mb3 tc">
      Max Players: {p.maxPlayers} <br></br>
      Time Limit: {p.timeLimit}
    </div>
  )
}

function CreateLobbyButton(p: DisplaySettingsProps) {
  function createNewLobby() {
    createLobby(p.userId, p.maxPlayers, p.timeLimit, true).catch(handleError)
  }
  const active = p.maxPlayers != 0 && p.timeLimit != 0
  return (
    <div className="mb4">
      <Link_Self
        Component={Button}
        onClick={() => {
          active ? createNewLobby() : alert('Must choose non-zero Player/Time Limit')
        }}
        //to={active ? getLobbyWaitPath() : undefined}
        to={active ? getLobbyMainPath() : undefined}
      >
        Create Lobby
      </Link_Self>
    </div>
  )
}

function ResetButton(p: SettingsProps) {
  return (
    <div className="mb4">
      <Button
        onClick={() => {
          p.setMax(0)
          p.setTime(0)
        }}
      >
        Reset
      </Button>
    </div>
  )
}

const MR = style('div', 'mr3')
