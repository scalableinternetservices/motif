import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { TileType } from '../graphql/schema.types'
import { Move } from './Move'

@Entity()
export class Tile extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  value: number

  @Column()
  location: number

  @Column()
  letter: string

  @Column({
    type: 'enum',
    enum: TileType,
    default: TileType.Normal,
  })
  tileType: TileType

  @ManyToOne(() => Move, move => move.tiles)
  move: Move
}
