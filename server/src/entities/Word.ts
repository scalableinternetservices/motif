import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Dictionary } from './Dictionary'

@Entity()
export class Word {
  @PrimaryGeneratedColumn()
  id: number

  @OneToOne(() => Dictionary)
  @JoinColumn()
  dictionary: Dictionary

  @Column()
  word: string
}
