import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm'
import { MoveType } from '../graphql/schema.types'
import { Lobby } from './Lobby'
import { Player } from './Player'
import { Tile } from './Tile'

@Entity()
export class Move extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => Player, { onDelete: 'SET NULL', eager: true })
  @JoinColumn()
  player: Player

  @Column({ nullable: true })
  lobbyId: number

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

  @Column({ nullable: true })
  pointValue: number
}
