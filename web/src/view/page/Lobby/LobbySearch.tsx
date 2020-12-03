import { useQuery } from '@apollo/client'
import { RouteComponentProps } from '@reach/router'
import * as React from 'react'
import { FetchLobbies } from '../../../graphql/query.gen'
import { Button } from '../../../style/button'
import { Input } from '../../../style/input'
import { style } from '../../../style/styled'
import { UserContext } from '../../auth/user'
import { link, Link_Self } from '../../nav/Link'
import { AppRouteParams, getLobbyWaitPath } from '../../nav/route'
import { handleError } from '../../toast/error'
import { Page } from '../Page'
import { CreateLobby } from './CreateLobby'
import { fetchLobbies } from './fetchLobbies'
import { joinLobby } from './mutateLobbies'

interface LobbySearchProps extends RouteComponentProps, AppRouteParams {}

export interface UserInfo {
  userId: number
}

interface LobbyButtonProps extends UserInfo {
  active: boolean
  id: number
}

interface LobbyEntryProps extends UserInfo {
  name: string
  maxPlayers: number
  curPlayers: number
  active: boolean
  id: number
}

export function LobbySearchMain(props: LobbySearchProps) {
  const { user } = React.useContext(UserContext)
  if (user == null) {
    return <Page>User not found. Sign up as a user.</Page>
  }

  return (
    <Page>
      <Content>
        <LContent>
          <div className="baseCanvas">
            <LobbyContainer userId={user.id} />
          </div>
        </LContent>
        <RContent>
          <CreateLobby />
        </RContent>
      </Content>
    </Page>
  )
}

function LobbyContainer(p: UserInfo) {
  return (
    <div className="mw6">
      <div className="ba h3 mb3 bg-black-10 flex items-center">
        <h1 className="center">Lobbies</h1>
      </div>
      <LobbyList userId={p.userId} />
    </div>
  )
}

function LobbyButton(p: LobbyButtonProps) {
  function handleJoinLobby(userId: number, lobbyId: number) {
    joinLobby(userId, lobbyId).catch(handleError)
  }

  if (p.userId == null) {
    return (
      <div className="o-50">
        <Link_Self onClick={() => alert('Please create a user session before continuing ')}>Join</Link_Self>
      </div>
    )
  }

  return (
    <div className={p.active ? 'o-100' : 'o-50'}>
      <Link_Self
        onClick={p.active ? () => handleJoinLobby(p.userId, p.id) : () => alert('Lobby is full')}
        to={p.active ? getLobbyWaitPath() : undefined}
      >
        Join
      </Link_Self>
    </div>
  )
}

function LobbyEntry(p: LobbyEntryProps) {
  return (
    <div className="cf pa2-ns">
      <div className="ba fl w-100 w-50-ns pa2">{p.name}</div>
      <div className="ba fl w-100 w-25-ns pa2">{'' + p.curPlayers + '/' + p.maxPlayers}</div>
      <div className="ba fl w-100 w-25-ns pa2">
        <LobbyButton userId={p.userId} active={p.active} id={p.id} />
      </div>
    </div>
  )
}

function LobbyList(p: UserInfo) {
  //let [lobbies, setLobbies] =  React.useState([]);
  const [, setField] = React.useState('') //TODO: Remove if we don't go forward with the feature of a lobby name
  //Query for lobbies from the database and display them in a list
  const { loading, data } = useQuery<FetchLobbies>(fetchLobbies, {
    fetchPolicy: 'cache-and-network',
    pollInterval: 5000, //Comment out when using subscription
  })
  if (loading) {
    return <div>loading...</div>
  }
  if (!data || data.lobbies?.length == 0) {
    return <div>no lobbies</div>
  }

  return (
    <div>
      <div className="flex justify-center">
        <Input placeholder="Search..." $onChange={setField}></Input>
      </div>
      {data.lobbies
        ?.filter(lobby => lobby.id > 0)
        .map((lobby, i) => (
          <div key={i}>
            <LobbyEntry
              key={lobby.id}
              name={lobby.gameTime.toString()}
              maxPlayers={lobby.maxUsers}
              curPlayers={lobby.players.length}
              active={lobby.maxUsers - lobby.players.length > 0}
              id={lobby.id}
              userId={p.userId}
            />
          </div>
        ))}
    </div>
  )
}

export const ButtonLink = link(Button)
const LContent = style('div', 'flex-grow-0 w-70-l ')
const RContent = style('div', 'flex-grow-0  w-30-l')
const Content = style('div', 'flex-l')
