import * as React from 'react';
import { Button } from '../../style/button';

export function LobbyWaitMain() {
  return (
    <div>
        <LobbyContainer/>
      </div>
    );
}

function LobbyContainer() {
  return (
      <div>
          <div className="mw6 center">
            <div className="ba h3 mb3 bg-black-10 flex items-center">
              <h1 className="center">Lobbies</h1>
            </div>
          </div>
          <div className="fixed top-2 left-10 ">
            <ExitButton/>
          </div>
        </div>
  )
}

function ExitButton() {
  return (
    <Button $color="sky" onClick={() => alert("exiting lobby...")}>Exit</Button>
  );
}