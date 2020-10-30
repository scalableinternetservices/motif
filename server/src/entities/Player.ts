import { BaseEntity, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Lobby } from './Lobby'
import { User } from './User'

@Entity()
export class Player extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @OneToOne(() => User)
  @JoinColumn()
  user: User

  @OneToOne(() => Lobby)
  @JoinColumn()
  lobby: Lobby
}
