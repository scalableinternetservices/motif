/*
 * Moves are the changes to the model of one player's game state
 * Player Moves:
 *   1) select a Tile (from their current board)
 *   2) deselect last Tile
 *   3) submit
 *   4) scramble?
 * Server Move:
 *   5) generate Tiles
 */

export interface Tile {
  letter: string
  pointValue: number
  dud: boolean
}

// might need to convert these classes to TypeORM or GraphQL
export interface Move {
  playerId: number
  time: number
}

export interface SelectTile extends Move {
  tile: Tile
  tileLocation: number
}

export interface DeselectTile extends Move {
  tile: Tile
}

export interface Submit extends Move {
  tiles: Tile[]
  pointValue: number
}
export type Scramble = Move

export interface SpawnTiles extends Move {
  tiles: Tile[]
}

export interface Board {
  tiles: Tile[]
}
