import { RouteComponentProps, useLocation } from '@reach/router'
import * as React from 'react'
import { Lobby, LobbyState } from '../../../../server/src/graphql/schema.types'
import { UserContext } from '../auth/user'
import { AppRouteParams } from '../nav/route'
import Game from './Game'
import { Page } from './Page'

// eslint-disable-next-line prettier/prettier
interface PlaygroundPageProps extends RouteComponentProps, AppRouteParams { }

export function BoardPage(props: PlaygroundPageProps) {
  const { user } = React.useContext(UserContext)
  const lobby: Lobby = {
    id: LobbyWaitWrap(),
    state: LobbyState.InGame,
    players: [],
    spectators: [],
    moves: [],
    gameTime: 300,
    maxUsers: 3,
  }
  console.log('user id: ' + user?.id)
  console.log('Lobby: ' + LobbyWaitWrap())
  return (
    <Page>
      <Game playerID={user?.id} timeLimit={30} lobbyinfo={lobby} />
    </Page>
  )
}

function LobbyWaitWrap() {
  const location = useLocation()
  const [, lobbyId] = (location.search || '').split('?lobbyId=')
  return lobbyId ? Number(lobbyId) : 0
}
