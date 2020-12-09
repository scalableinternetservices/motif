import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { LobbyState } from '../graphql/schema.types'
import { Message } from './Message'
import { Move } from './Move'
import { Player } from './Player'
import { Spectator } from './Spectator'

@Entity()
export class Lobby extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  maxUsers: number

  @Column()
  // TODO store in minutes, decide on a min/max
  gameTime: number

  @Column({
    type: 'enum',
    enum: LobbyState,
    default: LobbyState.Private,
  })
  state: LobbyState

  @Column({ type: 'timestamp', precision: 3, nullable: true })
  startTime: Date

  @OneToMany(() => Move, move => move.lobby, { eager: true })
  moves: Move[]

  @OneToMany(() => Player, player => player.lobby)
  players: Player[]

  @OneToMany(() => Spectator, spectator => spectator.lobby)
  spectators: Spectator[]

  @OneToMany(() => Message, message => message.lobby)
  messages: Message[]
}
