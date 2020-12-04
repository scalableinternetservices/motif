import { RouteComponentProps } from '@reach/router'
import * as React from 'react'
import { Lobby, LobbyState } from '../../../../server/src/graphql/schema.types'
import { UserContext } from '../auth/user'
import { AppRouteParams } from '../nav/route'
import Game from './Game'
import { Page } from './Page'

// eslint-disable-next-line prettier/prettier
interface PlaygroundPageProps extends RouteComponentProps, AppRouteParams {
  lobbyId?: number
  playerId?: number
  timeLimit?: number
  maxUsers?: number
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function BoardPage(props: PlaygroundPageProps) {
  const { user } = React.useContext(UserContext)
  const lobby: Lobby = {
    id: props.lobbyId ? props.lobbyId : 0,
    state: LobbyState.InGame,
    players: [],
    spectators: [],
    moves: [],
    gameTime: props.timeLimit ? props.timeLimit : 300,
    maxUsers: props.maxUsers ? props.maxUsers : 3,
  }
  console.log('user id: ' + user?.id)
  console.log('Lobby: ' + props.lobbyId)
  return (
    <Page>
      <Game playerID={props.playerId} timeLimit={props.timeLimit ? props.timeLimit : 60} lobbyinfo={lobby} />
    </Page>
  )
}
