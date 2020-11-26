import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Lobby } from './Lobby'
import { User } from './User'

@Entity()
export class Player extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  userId: number

  @OneToOne(() => User, { cascade: true })
  @JoinColumn()
  user: User

  @Column({default: null})
  lobbyId: number

  @ManyToOne(() => Lobby, lobby => lobby.players, { onDelete: 'CASCADE' })
  lobby: Lobby
}
