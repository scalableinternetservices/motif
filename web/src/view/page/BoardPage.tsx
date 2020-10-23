import { RouteComponentProps } from '@reach/router';
import * as React from 'react';
import { AppRouteParams, PlaygroundApp } from '../nav/route';
import Game from './Game';
import { Page } from './Page';


interface PlaygroundPageProps extends RouteComponentProps, AppRouteParams { }

export function BoardPage(props: PlaygroundPageProps) {
  //tryy();
  return <Page><Game /><div><button className="button" onClick={tryy}>JUANS PAGE </button></div></Page>
}

function tryy() {
  console.log("work pls");
}
export function getBoardApp(app?: PlaygroundApp) {
  let blocks = []
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      blocks.push(<div className="button" key={i * 4 + j}> {i * 4 + j}</div>)
    }
  }
  return <div > <h2 onClick={tryy}>JUANS PAGE </h2>
    <Game />
  </div>
}
