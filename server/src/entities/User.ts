import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'
import { User as GraphqlUser, UserType } from '../graphql/schema.types'
import { Player } from './Player'

@Entity()
export class User extends BaseEntity implements GraphqlUser {
  @PrimaryGeneratedColumn()
  id: number

  @CreateDateColumn()
  timeCreated: Date

  @UpdateDateColumn()
  timeUpdated: Date

  @Column({
    length: 100,
    default: '123@ucla.edu'
  })
  email: string

  @Column({
    type: 'enum',
    enum: UserType,
    default: UserType.User,
  })
  userType: UserType

  @Column({
    length: 100,
    nullable: true,
  })
  name: string

  @OneToOne(() => Player, { onDelete: 'SET NULL' })
  @JoinColumn()
  player: Player
}
