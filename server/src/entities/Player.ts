import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Lobby } from './Lobby'
import { User } from './User'

@Entity()
export class Player extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @OneToOne(() => User, { cascade: true })
  @JoinColumn()
  user: User

  @Column({ nullable: true })
  lobbyId: number

  @ManyToOne(() => Lobby, lobby => lobby.players, { onDelete: 'SET NULL' })
  lobby: Lobby
}
