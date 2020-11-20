import { BaseEntity, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Lobby } from './Lobby'
import { User } from './User'

@Entity()
export class Player extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @OneToOne(() => User, { cascade: true })
  @JoinColumn()
  user: User

  @ManyToOne(() => Lobby, lobby => lobby.players, { onDelete: 'SET NULL' })
  lobby: Lobby
}
