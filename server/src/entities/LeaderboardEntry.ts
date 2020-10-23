import { Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Game } from './Game'
import { User } from './User'

@Entity()
export class LeaderboardEntry {
  @PrimaryGeneratedColumn()
  id: number

  @OneToOne(() => User)
  @JoinColumn()
  user: User

  @OneToOne(() => Game)
  @JoinColumn()
  game: Game
}
