import * as React from 'react'
import { ColorName, Colors } from '../../../../common/src/colors'
import {
  DeselectTile,
  Lobby,
  LobbyState,
  MoveType,
  Player,
  Scramble,
  SelectTile,
  Submit,
  Tile,
  // eslint-disable-next-line prettier/prettier
  TileType
} from '../../../../server/src/graphql/schema.types'
import { Spacer } from '../../style/spacer'
import { style } from '../../style/styled'
import { deselectMove, randomizeMove, selectMove, submitMove } from './GameMutations'

export default class Game extends React.Component<
  {
    playerID?: number
    timeLimit: number
    lobbyinfo: Lobby
    move?: number
  },
  any
> {
  playerWords = ''
  playerScore = 0
  board: Tile[] = []
  active: boolean[] = []
  moveStack: number[] = []
  submitTiles: Tile[] = []
  startTime = new Date().getTime()
  timer: any
  finished = false
  player: Player = {
    id: -1,
    lobby: {
      id: -1,
      state: LobbyState.InGame,
      players: [],
      spectators: [],
      moves: [],
      gameTime: 300,
      maxUsers: 3,
    },
  }
  enemyTiles: Tile[][] = [[], []]
  enemyScores: number[] = [0, 0]
  enemyPlayers = 2
  dictionary: string[] = []

  constructor(props: any) {
    super(props)
    this.state = {
      playerID: props.playerID,
      timeLimit: props.timeLimit,
      lobbyinfo: props.lobbyinfo,
      timeRemaining: props.timeLimit * 10,
      move: 0,
    }
    //bind methods needed so they can be called when clicked
    this.randomizeBoard = this.randomizeBoard.bind(this)
    this.tileClicked = this.tileClicked.bind(this)
    this.submitWord = this.submitWord.bind(this)
    this.countdown = this.countdown.bind(this)

    //variable setup
    this.player = { id: this.state.playerID, lobby: this.state.lobbyinfo }
    this.timer = setInterval(this.countdown, 100)
    for (let i = 0; i < 16; i++) {
      this.active.push(false)
      this.board.push({ id: 0, letter: 'X', pointValue: 0, location: 0, tileType: TileType.Normal })
      for (let p = 0; p < this.enemyPlayers; p++) {
        this.enemyTiles[p].push({ id: 0, letter: 'X', pointValue: 0, location: 0, tileType: TileType.Normal })
      }
    }
  }
  countdown() {
    const timeLeft = this.state.timeRemaining - 1
    if (timeLeft == 0) {
      this.finished = true
      clearInterval(this.timer)
    }
    this.setState({
      timeRemaining: timeLeft,
    })
  }
  initalizeBoard() {
    for (let i = 0; i < 16; i++) {
      const c = this.getRandomLetter()
      this.board[i] = { id: 0, letter: c, pointValue: pointVal[c], location: i, tileType: TileType.Normal }
    }
  }
  randomizeBoard() {
    for (let i = 0; i < 16; i++) {
      const c = this.getRandomLetter()
      this.active[i] = false
      this.board[i].letter = c
      this.board[i].pointValue = pointVal[c]
    }
    const scramble: Scramble = {
      player: this.player,
      time: new Date().getTime() - this.startTime,
      moveType: MoveType.Scramble,
    }
    //randomize move sent to server
    randomizeMove(scramble)
      .then(() => console.log('Randomize move worked'))
      .catch(() => console.log('broke'))

    this.playerWords = ''
    this.setState({
      move: this.state.move + 1,
    })
    this.moveStack = []
  }
  getRandomLetter() {
    //A-9, B-2, C-2, D-4, E-12, F-2, G-3, H-2, I-9, J-1, K-1, L-4, M-2, N-6, O-8, P-2, Q-1, R-6, S-4, T-6, U-4, V-2, W-2, X-1, Y-2, Z-1
    const characters =
      'AAAAAAAAABBCCDDDDEEEEEEEEEEEEFFGGGHHIIIIIIIIIJKLLLLMMNNNNNNOOOOOOOOPPQRRRRRRSSSSTTTTTTUUUUVVWWXYYZ'
    const len = characters.length
    return characters.charAt(Math.floor(Math.random() * len))
  }

  tileClicked(letter: string, key: number) {
    const len = this.moveStack.length
    if (len > 0 && key == this.moveStack[len - 1]) {
      const deselect: DeselectTile = {
        player: this.player,
        moveType: MoveType.DeselectTile,
        time: new Date().getTime() - this.startTime,
        tiles: [this.board[key]],
      }
      //sent deselect move
      deselectMove(deselect)
        .then(() => console.log('Deselect move worked'))
        .catch(() => console.log('broke'))

      this.moveStack.pop()
      this.submitTiles.pop()
      this.playerWords = this.playerWords.slice(0, -1)
      this.active[key] = false
      this.setState({
        move: this.state.move + 1,
      })
      return
    }
    if (this.active[key] == true) return

    this.playerWords += letter
    this.active[key] = true
    this.moveStack.push(key)
    this.submitTiles.push({
      id: this.board[key].id,
      letter: this.board[key].letter,
      pointValue: this.board[key].pointValue,
      location: this.board[key].location,
      tileType: this.board[key].tileType,
    })

    const select: SelectTile = {
      player: this.player,
      moveType: MoveType.DeselectTile,
      time: new Date().getTime() - this.startTime,
      tiles: [this.board[key]],
    }
    selectMove(select)
      .then(() => console.log('Select worked'))
      .catch(() => console.log('broke'))
    this.setState({
      move: this.state.move + 1,
    })
  }

  submitWord() {
    //submit word
    console.log('The submitted word is:' + this.playerWords)
    let nl = ''
    let score = 0
    for (let i = 0; i < 16; i++) {
      if (this.active[i] === true) {
        score += this.board[i].pointValue
        nl = this.getRandomLetter()
        this.active[i] = false
        this.board[i].letter = nl
        this.board[i].pointValue = pointVal[nl]
      }
    }
    const submit: Submit = {
      id: 0,
      player: this.player,
      time: new Date().getTime() - this.startTime,
      moveType: MoveType.Submit,
      tiles: this.submitTiles,
      pointValue: score,
    }

    this.playerScore += score
    this.moveStack = []
    this.submitTiles = []
    this.playerWords = ''
    this.setState({
      move: this.state.move + 1,
    })
    submitMove(submit)
      .then(() => console.log('Submit worked'))
      .catch(() => console.log('broke'))
    //Send word to server
  }

  render() {
    const tiles = []
    //const enemy1Tiles = []
    //const enemy2Tiles = []
    const enemyTiles = [[<div key={0}></div>]]
    enemyTiles.pop()
    for (let p = 0; p < this.enemyPlayers; p++) {
      enemyTiles.push([])
    }
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const index = i * 4 + j
        const c = this.board[index].letter
        const active = this.active[index]
        tiles.push(
          <div className={active ? 'redTile' : 'Tile'} onClick={() => this.tileClicked(c, index)} key={index}>
            {c}
          </div>
        )
        for (let p = 0; p < this.enemyPlayers; p++) {
          enemyTiles[p].push(
            //<div className={this.enemyTiles[p][index]'miniTile'} key={index}>
            <div className="miniTile" key={index}>
              {this.enemyTiles[p][index].letter}
            </div>
          )
        }
        /*         enemy1Tiles.push(
          <div className="miniTile" key={index}>
            {c}
          </div>
        )
        enemy2Tiles.push(
          <div className="miniTile" key={index}>
            {c}
          </div>
        ) */
      }
    }
    if (!this.finished) {
      return (
        <Content>
          <div className="column">
            <div>Player 2 score: {this.enemyScores[0]}</div>
            <div className="miniBoard">{enemyTiles[0]}</div>
            <Spacer $h5 />
            <div>Player 3 score: {this.enemyScores[1]}</div>
            <div className="miniBoard">{enemyTiles[1]}</div>
          </div>
          <div className="column">
            <div>Time Remaining: {this.state.timeRemaining / 10}</div>
            <div>Your Score: {this.playerScore}</div>
            <Spacer $h1 />
            <div className="board">{tiles}</div>
            <div className="wordbox">{'Word: ' + this.playerWords}</div>
            <button className="button" onClick={this.submitWord}>
              Submit
            </button>

            <button className="button" onClick={this.randomizeBoard}>
              Randomize
            </button>
          </div>
          <div className="chat">
            <RContent>
              <Section>
                <h2> CHATROOM HERE </h2>
              </Section>
            </RContent>
          </div>
        </Content>
      )
    } else {
      //calc scores
      const ranks = ['1st', '2nd', '3rd']
      let place = this.enemyPlayers
      for (let p = 0; p < this.enemyPlayers; p++) {
        if (this.enemyScores[p] <= this.playerScore) {
          place--
        }
      }
      return (
        <div className="resultText">
          <div> Game is Finished </div>
          <Spacer $h5 />
          <div> You Placed {ranks[place]}</div>
          <div> Your score: {this.playerScore}</div>
        </div>
      )
    }
  }
}
/*const Hero = style('div', 'mb4 w-100 ba b--mid-gray br2 pa3 tc', {
  borderLeftColor: Colors.lemon + '!important',
  borderRightColor: Colors.lemon + '!important',
  borderLeftWidth: '4px',
  borderRightWidth: '4px',
})*/

const Content = style('div', 'flex-l')

const RContent = style('div', 'flex-grow-0  w-30-r')

const Section = style('div', 'mb4 mid-gray ba b--mid-gray br2 pa3', (p: { $color?: ColorName }) => ({
  borderLeftColor: Colors[p.$color || 'lemon'] + '!important',
  borderLeftWidth: '3px',
}))

const pointVal: { [letter: string]: number } = {
  A: 1,
  B: 3,
  C: 3,
  D: 2,
  E: 1,
  F: 4,
  G: 2,
  H: 4,
  I: 1,
  J: 8,
  K: 5,
  L: 1,
  M: 3,
  N: 1,
  O: 1,
  P: 3,
  Q: 10,
  R: 1,
  S: 1,
  T: 1,
  U: 1,
  V: 4,
  W: 4,
  X: 8,
  Y: 4,
  Z: 10,
}
