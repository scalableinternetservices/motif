import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { LobbyState, Move, Player } from '../graphql/schema.types'

@Entity()
export class Lobby extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  maxUsers: number

  @Column()
  // TODO store in minutes, decide on a min/max
  gameTime: number

  @Column()
  moves: Move[]

  @Column({
    type: 'enum',
    enum: LobbyState,
    default: LobbyState.Private,
  })
  state: LobbyState

  @Column()
  players: Player[]

  @Column()
  spectators: Player[]
}
