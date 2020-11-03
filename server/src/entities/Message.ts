import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Lobby } from './Lobby'
import { User } from './User'

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => Lobby, lobby => lobby.messages)
  lobby: Lobby

  @OneToOne(() => User)
  @JoinColumn()
  user: User

  @Column()
  content: string

  @CreateDateColumn()
  timestamp: Date
}
