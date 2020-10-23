import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class Game {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  state: string

  @Column()
  status: boolean

  @Column()
  score: number
}
