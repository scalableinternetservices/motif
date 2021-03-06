import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Lobby } from './Lobby'
import { Player } from './Player'

@Entity()
export class Spectator {
  @PrimaryGeneratedColumn()
  id: number

  @OneToOne(() => Player)
  @JoinColumn()
  player: Player

  @Column()
  lobbyId: number

  @ManyToOne(() => Lobby, lobby => lobby.spectators)
  lobby: Lobby
}
