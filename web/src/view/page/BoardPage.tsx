import { RouteComponentProps } from '@reach/router'
import * as React from 'react'
import { Lobby, LobbyState } from '../../../../server/src/graphql/schema.types'
import { AppRouteParams } from '../nav/route'
import Game from './Game'
import { Page } from './Page'

// eslint-disable-next-line prettier/prettier
interface PlaygroundPageProps extends RouteComponentProps, AppRouteParams { }

//export function BoardPage(props: PlaygroundPageProps) {
export function BoardPage(props: PlaygroundPageProps) {
  const lobby: Lobby = {
    id: -1,
    state: LobbyState.Public,
    players: [],
    spectators: [],
    moves: [],
    gameTime: 300,
    maxUsers: 3,
  }
  return (
    <Page>
      <Game playerID={9} timeLimit={30} lobbyinfo={lobby} />
    </Page>
  )
}

function tryy() {
  console.log('work pls')
}
//export function getBoardApp(app?: PlaygroundApp) {
export function getBoardApp() {
  const blocks = []
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      blocks.push(
        <div className="button" key={i * 4 + j}>
          {i * 4 + j}
        </div>
      )
    }
  }
  return (
    <div>
      <h2 onClick={tryy}>JUANS PAGE </h2>
    </div>
  )
}
