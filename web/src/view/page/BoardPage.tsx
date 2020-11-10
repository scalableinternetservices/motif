import { RouteComponentProps } from '@reach/router'
import * as React from 'react'
import { AppRouteParams } from '../nav/route'
import Game from './Game'
import { Page } from './Page'

// eslint-disable-next-line prettier/prettier
interface PlaygroundPageProps extends RouteComponentProps, AppRouteParams { }

//export function BoardPage(props: PlaygroundPageProps) {
export function BoardPage(props: PlaygroundPageProps) {
  return (
    <Page>
      <Game playerID={0} timeLimit={300} lobbyID={0} />
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
