import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class Lobby {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  maxUsers: number

  @Column()
  // TODO store in minutes, decide on a min/max
  gameTime: number
}
