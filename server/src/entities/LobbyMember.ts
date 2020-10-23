import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Lobby } from './Lobby'
import { User } from './User'

@Entity()
export class LobbyMember {
  @PrimaryGeneratedColumn()
  id: number

  @OneToOne(() => Lobby)
  @JoinColumn()
  lobby: Lobby

  @OneToOne(() => User)
  @JoinColumn()
  user: User

  @Column()
  userType: boolean
}
