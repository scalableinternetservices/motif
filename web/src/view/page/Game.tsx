//import React, { Component } from 'react';
import * as React from 'react'
import { ColorName, Colors } from '../../../../common/src/colors'
import {
  DeselectTile,
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
export default class Game extends React.Component<any, any> {
  playerWords = ''
  board: string[] = []
  board2: Tile[] = []
  active: boolean[] = []
  moveStack: number[] = []
  startTime = new Date().getTime()
  //we will probably pass in player ID and lobby
  playerID: Player = { id: 0 } //lobby is missing

  constructor(props: any) {
    super(props)
    this.state = {
      player: 1,
      move: 0,
    }
    //bind methods needed so they can be called when clicked
    this.randomizeBoard = this.randomizeBoard.bind(this)
    this.tileClicked = this.tileClicked.bind(this)
    this.submitWord = this.submitWord.bind(this)

    //variable setups
    console.log(this.startTime)
    for (let i = 0; i < 16; i++) {
      this.active.push(false)
      this.board.push('X')
      this.board2.push({ id: 0, letter: 'X', value: 0, location: 0, tileType: TileType.Normal })
    }
  }
  initalizeBoard() {
    for (let i = 0; i < 16; i++) {
      const c = this.getRandomLetter()
      this.board[i] = c
      this.board2[i] = { id: 0, letter: this.board[i], value: pointVal[c], location: i, tileType: TileType.Normal }
    }
    //this.setState({ move: 1 })
  }
  randomizeBoard() {
    for (let i = 0; i < 16; i++) {
      const c = this.getRandomLetter()
      this.board[i] = c
      this.active[i] = false
      this.board2[i].letter = c
      this.board2[i].value = pointVal[c]
    }
    const scramble: Scramble = {
      player: this.playerID,
      time: new Date().getTime() - this.startTime,
      moveType: MoveType.Scramble,
    }
    console.log('send scramble: ' + scramble.time)

    this.playerWords = ''
    this.setState({ move: 1 })
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
    //add a check if it is the last tile clicked
    const len = this.moveStack.length
    if (len > 0 && key == this.moveStack[len - 1]) {
      const deselect: DeselectTile = {
        player: this.playerID,
        moveType: MoveType.DeselectTile,
        time: new Date().getTime() - this.startTime,
        tiles: this.board2,
      }
      console.log('send DeselectTile: ' + deselect.time)

      this.moveStack.pop()
      this.playerWords = this.playerWords.slice(0, -1)
      this.active[key] = false
      this.setState({ move: 1 })
      return
    }
    if (this.active[key] == true) return

    this.playerWords += letter
    this.active[key] = true
    this.moveStack.push(key)
    console.log('current word:' + this.playerWords)

    const select: SelectTile = {
      player: this.playerID,
      moveType: MoveType.DeselectTile,
      time: new Date().getTime() - this.startTime,
      tiles: this.board2,
    }
    console.log('send selectTile: ' + select.time)
    this.setState({ move: 1 })
  }

  submitWord() {
    //submit word
    console.log('The submitted word is:' + this.playerWords)
    let nl = ''
    let score = 0
    for (let i = 0; i < 16; i++) {
      if (this.active[i] === true) {
        score += this.board2[i].value
        nl = this.getRandomLetter()
        this.board[i] = nl
        this.active[i] = false
        this.board2[i].letter = nl
        this.board2[i].value = pointVal[nl]
      }
    }
    const submit: Submit = {
      id: 0,
      player: this.playerID,
      time: new Date().getTime() - this.startTime,
      moveType: MoveType.Submit,
      tiles: this.board2,
      pointValue: score,
    }
    console.log('send submit: ' + submit.time)

    this.moveStack = []
    this.playerWords = ''
    this.setState({ move: 1 })

    //Send word to server
  }

  render() {
    const tiles = []
    const enemy1Tiles = []
    const enemy2Tiles = []
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const index = i * 4 + j
        //const c = this.board[index]
        const c = this.board2[index].letter
        const active = this.active[index]
        tiles.push(
          <div className={active ? 'redTile' : 'Tile'} onClick={() => this.tileClicked(c, index)} key={index}>
            {c}
          </div>
        )
        enemy1Tiles.push(
          <div className="miniTile" key={index}>
            {c}
          </div>
        )
        enemy2Tiles.push(
          <div className="miniTile" key={index}>
            {c}
          </div>
        )
      }
    }
    return (
      <Content>
        <div className="column">
          <div className="miniBoard">{enemy1Tiles}</div>
          <Spacer $h5 />
          <div className="miniBoard">{enemy2Tiles}</div>
        </div>
        <div className="column">
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
/*const LContent = style('div', 'flex-grow-0 w-70-l mr4-l')


*/
