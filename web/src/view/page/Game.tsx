//import React, { Component } from 'react';
import * as React from 'react'
import { ColorName, Colors } from '../../../../common/src/colors'
import { Spacer } from '../../style/spacer'
import { style } from '../../style/styled'

export default class Game extends React.Component<any, any> {
  playerWords = ''
  board: string[] = []
  move = 0
  active: boolean[] = []
  moveStack: number[] = []
  constructor(props: any) {
    super(props)
    this.state = {
      player: 1,
      status: '',
      move: 0,
    }
    //bind methods
    this.randomizeBoard = this.randomizeBoard.bind(this)
    this.addToWord = this.addToWord.bind(this)
    this.submit = this.submit.bind(this)
    //variable setups
    for (let i = 0; i < 16; i++) {
      this.active.push(false)
      this.board.push('X')
    }
  }
  initalizeBoard() {
    for (let i = 0; i < 16; i++) {
      this.board[i] = this.getRandomLetter()
    }
    //this.setState({ move: 1 })
  }
  randomizeBoard() {
    for (let i = 0; i < 16; i++) {
      this.board[i] = this.getRandomLetter()
      this.active[i] = false
    }
    this.playerWords = ''
    this.setState({ move: 1 })
    this.moveStack = []
  }
  getRandomLetter() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const len = 26
    return characters.charAt(Math.floor(Math.random() * len))
  }

  createTiles() {
    console.log('empty for now')
  }

  addToWord(letter: string, key: number) {
    //add a check if it is the last tile clicked
    const len = this.moveStack.length
    if (len > 0 && key == this.moveStack[len - 1]) {
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
    this.setState({ move: 1 })
  }

  submit() {
    //submit word
    console.log('The submitted word is:' + this.playerWords)
    let nl = ''
    for (let i = 0; i < 16; i++) {
      if (this.active[i] === true) {
        console.log('change')
        nl = this.getRandomLetter()
        this.board[i] = nl
        this.active[i] = false
      }
    }

    this.moveStack = []
    this.playerWords = ''
    this.setState({ move: 1 })

    //Send word to server
  }

  getCurrentWord(player: number) {
    return this.playerWords[player]
  }

  render() {
    const tiles = []
    const enemy1Tiles = []
    const enemy2Tiles = []
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const index = i * 4 + j
        const c = this.board[index]
        const active = this.active[index]
        tiles.push(
          <div className={active ? 'redTile' : 'Tile'} onClick={() => this.addToWord(c, i * 4 + j)} key={i * 4 + j}>
            {c}
          </div>
        )
        enemy1Tiles.push(
          <div className="miniTile" key={i * 4 + j}>
            {c}
          </div>
        )
        enemy2Tiles.push(
          <div className="miniTile" key={i * 4 + j}>
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
          <button className="button" onClick={this.submit}>
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
