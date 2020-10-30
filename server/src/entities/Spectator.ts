import { Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Lobby } from './Lobby'
import { Player } from './Player'

@Entity()
export class Spectator {
  @PrimaryGeneratedColumn()
  id: number

  @OneToOne(() => Player)
  @JoinColumn()
  player: Player

  @OneToOne(() => Lobby)
  @JoinColumn()
  lobby: Lobby
}
