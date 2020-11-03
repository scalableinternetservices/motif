import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { TileType } from '../graphql/schema.types'
import { Move } from './Move'

@Entity()
export class Tile {
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
  })
  tiletype: TileType

  @ManyToOne(() => Move, move => move.tiles)
  move: Move
}
