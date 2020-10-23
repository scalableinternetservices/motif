import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Game } from './Game'
import { User } from './User'

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number

  @OneToOne(() => Game)
  @JoinColumn()
  game: Game

  @OneToOne(() => User)
  @JoinColumn()
  user: User

  @Column()
  content: string

  @Column()
  timestamp: Date
}
