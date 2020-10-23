//import React, { Component } from 'react';
import * as React from 'react';

export default class Game extends React.Component<any, any> {
  playerWords = ["", "", ""];
  board: string[] = [];
  constructor(props: any) {
    super(props);
    this.state = {
      player: 1,
      sourceSelection: -1,
      status: '',
      turn: 'white'
    }
    this.randomizeBoard();
    this.addToWord = this.addToWord.bind(this);
  }

  randomizeBoard() {
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let len = 26
    for (let i = 0; i < 16; i++) {
      this.board.push(characters.charAt(Math.floor(Math.random() * len)));
    }
  }

  createTiles() {

  }
  addToWord(letter: string, player: number) {
    this.playerWords[player] += letter;
    console.log(letter);
  }

  submit(player: number) {
    //submit word
    this.playerWords[player] = "";
  }

  getCurrentWord(player: number) {
    return this.playerWords[player];
  }

  render() {
    let tiles = []
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        let c = this.board[i * 4 + j];
        //console.log(c);
        tiles.push(
          <div className='tile' onClick={() => console.log("hey")} key={i * 4 + j}>
            {c}
          </div>);
      }
    }
    return (<div className='board'>{tiles}</div>);
  }

}