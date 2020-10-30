import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Lobby } from './Lobby'
import { User } from './User'

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number

  @OneToOne(() => Lobby)
  @JoinColumn()
  lobby: Lobby

  @OneToOne(() => User)
  @JoinColumn()
  user: User

  @Column()
  content: string

  @Column()
  timestamp: Date
}
