export function getRandomLetter(): string {
  // frequencies as follow:
  //A-9, B-2, C-2, D-4, E-12, F-2, G-3, H-2, I-9, J-1, K-1, L-4, M-2, N-6, O-8, P-2, Q-1, R-6, S-4, T-6, U-4, V-2, W-2, X-1, Y-2, Z-1
  const characters =
    'AAAAAAAAABBCCDDDDEEEEEEEEEEEEFFGGGHHIIIIIIIIIJKLLLLMMNNNNNNOOOOOOOOPPQRRRRRRSSSSTTTTTTUUUUVVWWXYYZ'
  const len = characters.length
  return characters.charAt(Math.floor(Math.random() * len))
}

// https://stackoverflow.com/questions/6831918/node-js-read-a-text-file-into-an-array-each-line-an-item-in-the-array
const fs = require('fs')
const readline = require('readline')
const dictionary: string[] = []
readline
  .createInterface({
    input: fs.createReadStream('../public/assets/words.txt'),
    terminal: false,
  })
  .on('line', (line: string) => dictionary.push(line))
export function validateWord(word: string): boolean {
  return dictionary.includes(word)
}

/*
 * Given list of moves, run them in chronological order
 * Determine what final game board is, and points scored
 */
export function estimateState(): string {
  let gameBoard = 'abc'
  gameBoard += 'def'
  return gameBoard
}
