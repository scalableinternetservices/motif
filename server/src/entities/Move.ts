import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn
} from 'typeorm'
import { MoveType } from '../graphql/schema.types'
import { Lobby } from './Lobby'
import { Player } from './Player'
import { Tile } from './Tile'

@Entity()
export class Move {
  @PrimaryGeneratedColumn()
  id: number

  @OneToOne(() => Player)
  @JoinColumn()
  player: Player

  @ManyToOne(() => Lobby, lobby => lobby.moves)
  lobby: Lobby

  @Column({
    type: 'enum',
    enum: MoveType,
  })
  moveType: MoveType

  @CreateDateColumn()
  time: Date

  @OneToMany(() => Tile, tile => tile.move, { eager: true })
  tiles: Tile[]
}
