import { useQuery } from '@apollo/client'
import { RouteComponentProps, useLocation } from '@reach/router'
import * as React from 'react'
import { ColorName, Colors } from '../../../../common/src/colors'
import { Lobby, LobbyState, Tile } from '../../../../server/src/graphql/schema.types'
import { FetchLobbyVariables, FetchUser, FetchUserVariables, TileType } from '../../graphql/query.gen'
import { Spacer } from '../../style/spacer'
import { style } from '../../style/styled'
import { UserContext } from '../auth/user'
import { AppRouteParams } from '../nav/route'
import Game from './Game'
import { fetchLobbyMoves } from './GameMutations'
import { fetchUser } from './Lobby/fetchLobbies'
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
  let lobby_id = 0
  if (props.lobbyId != null) lobby_id = props.lobbyId
  else lobby_id = LobbyWaitWrap()
  const lobby: Lobby = {
    id: lobby_id,
    state: LobbyState.InGame,
    players: [],
    spectators: [],
    moves: [],
    gameTime: props.timeLimit ? props.timeLimit : 300,
    maxUsers: props.maxUsers ? props.maxUsers : 3,
  }
  for (let p = 0; p < 16; p++) {
    enemy1board.push({ id: 0, letter: 'X', value: 0, location: p, tileType: TileType.Normal })
    active[0].push(false)
    enemy2board.push({ id: 0, letter: 'X', value: 0, location: p, tileType: TileType.Normal })
    active[1].push(false)
  }
  console.log('user id: ' + user?.id)
  userId = user ? user?.id : -2
  //console.log('Lobby: ' + LobbyWaitWrap())
  const { loading, data } = useQuery<FetchUser, FetchUserVariables>(fetchUser, {
    variables: { userId },
    fetchPolicy: 'cache-and-network',
  })
  console.log('player id: ' + data?.user?.player?.id)
  userId = data?.user?.player?.id ? data?.user?.player?.id : -2
  if (!loading) {
    return (
      <Page>
        <Content>
          <div className="column">
            <UpdateEnemyBoards lobbyId={lobby.id} />
          </div>
          <div className="column">
            <Game
              playerID={data?.user?.player?.id}
              timeLimit={props.timeLimit ? props.timeLimit * 60 : 60}
              lobbyinfo={lobby}
            />
          </div>
          <div className="column">
            <div className="chat">
              <RContent>
                <Section>
                  <h2> CHATROOM Under Construction </h2>
                </Section>
              </RContent>
            </div>
          </div>
        </Content>
      </Page>
    )
  } else {
    return <div>Loading Player Data</div>
  }
}

function LobbyWaitWrap() {
  const location = useLocation()
  const [, lobbyId] = (location.search || '').split('?lobbyId=')
  return lobbyId ? Number(lobbyId) : 0
}
interface uProps {
  lobbyId: number
}
interface LobbyVars {
  _typename: string
  //maxUsers: number
  //add state later in needed
  moves: MoveTypes[]
}
interface LobbyFetch {
  lobby: LobbyVars
}
interface MoveTypes {
  _typename: string
  time: number
  moveType: string
  player: { id: number }
  tiles: Tile[]
}
const enemy1board: Tile[] = []
const enemy2board: Tile[] = []
let enemy1Id = -1
let enemy2Id = -1
let userId = -1
let userScore = 0
const enemyPlayers = 2
const enemyScores = [0, 0]
const active: boolean[][] = [[], []]

function UpdateEnemyBoards(p: uProps) {
  const lobbyid = p.lobbyId
  const { loading, data } = useQuery<LobbyFetch, FetchLobbyVariables>(fetchLobbyMoves, {
    variables: { lobbyId: lobbyid },
    pollInterval: 1000,
    fetchPolicy: 'network-only',
  })

  let len = 0
  let moves: MoveTypes[] = []
  if (data == null) {
    console.log('lobby query returned null' + loading)
  } else {
    console.log(data?.lobby.moves)
    len = data?.lobby ? data?.lobby.moves.length : 0
    moves = data?.lobby.moves ? data?.lobby.moves : []
  }
  console.log('Player1: ' + userId)
  console.log('Player2 id: ' + enemy1Id + ', Player 3 id: ' + enemy2Id)
  enemyScores[0] = 0
  enemyScores[1] = 0
  for (let i = 0; i < len; i++) {
    if (moves[i].moveType == 'Submit') {
      if (moves[i].player.id == enemy1Id) {
        for (let t = 0; t < moves[i].tiles.length; t++) {
          enemyScores[0] += moves[i].tiles[t].value
        }
        clearActive(0)
      } else if (moves[i].player.id == enemy2Id) {
        for (let t = 0; t < moves[i].tiles.length; t++) {
          enemyScores[1] += moves[i].tiles[t].value
        }
        clearActive(1)
      } else if (moves[i].player.id == enemy1Id) {
        for (let t = 0; t < moves[i].tiles.length; t++) {
          userScore = userScore + moves[i].tiles[t].value
        }
      }
    }

    if (moves[i].moveType == 'SelectTile') {
      if (moves[i].player.id == enemy1Id && moves[i].tiles.length != 0) {
        active[0][moves[i].tiles[0].location] = true
      } else if (moves[i].player.id == enemy2Id && moves[i].tiles.length != 0) {
        active[1][moves[i].tiles[0].location] = true
      }
    }
    if (moves[i].moveType == 'DeselectTile') {
      if (moves[i].player.id == enemy1Id && moves[i].tiles.length != 0) {
        active[0][moves[i].tiles[0].location] = false
      } else if (moves[i].player.id == enemy2Id && moves[i].tiles.length != 0) {
        active[1][moves[i].tiles[0].location] = false
      }
    }
    if (moves[i].moveType == 'SpawnTiles') {
      if (enemy1Id == -1 && moves[i].player.id != userId) {
        enemy1Id = moves[i].player.id
      } else if (enemy2Id == -1 && moves[i].player.id != userId && moves[i].player.id != enemy1Id) {
        enemy2Id = moves[i].player.id
      }
      if (moves[i].tiles != null) {
        //check if null, incase server creates invalid move
        for (let t = 0; t < moves[i].tiles.length; t++) {
          if (moves[i].player.id == enemy1Id) {
            //console.log('location ' + moves[i].tiles[t].location + ' is updated with ' + moves[i].tiles[t].letter)
            enemy1board[moves[i].tiles[t].location] = moves[i].tiles[t]
          } else if (moves[i].player.id == enemy2Id) {
            enemy2board[moves[i].tiles[t].location] = moves[i].tiles[t]
          }
        }
      }
    }
  }
  const enemyTiles = [[<div key={0}></div>]]
  enemyTiles.pop()
  for (let p = 0; p < enemyPlayers; p++) {
    enemyTiles.push([])
  }
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const index = i * 4 + j
      //const c = enemy1board[i * 4 + j].letter
      //const active = this.active[index]
      enemyTiles[0].push(
        <div className={active[0][index] ? 'miniredTile' : 'miniTile'} key={index}>
          {enemy1board[index].letter}
        </div>
      )
      enemyTiles[1].push(
        <div className={active[1][index] ? 'miniredTile' : 'miniTile'} key={index}>
          {enemy2board[index].letter}
        </div>
      )
    }
  }
  return (
    <div>
      <div>Player 2 score: {enemyScores[0]}</div>
      <div className="miniBoard">{enemyTiles[0]}</div>
      <Spacer $h5 />
      <div>Player 3 score: {enemyScores[1]}</div>
      <div className="miniBoard">{enemyTiles[1]}</div>
    </div>
  )
}

function clearActive(ind: number) {
  for (let i = 0; i < 16; i++) active[ind][i] = false
}
const RContent = style('div', 'flex-grow-0  w-30-r')

const Section = style('div', 'mb4 mid-gray ba b--mid-gray br2 pa3', (p: { $color?: ColorName }) => ({
  borderLeftColor: Colors[p.$color || 'lemon'] + '!important',
  borderLeftWidth: '3px',
}))

const Content = style('div', 'flex-l')
