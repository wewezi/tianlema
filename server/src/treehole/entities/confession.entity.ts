import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

@Entity('confessions')
export class Confession {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column('text')
  content: string

  @Column({ default: 0 })
  sympathy: number

  @Column({ default: 0 })
  deserved: number

  @Column({ nullable: true })
  userId: number

  @CreateDateColumn()
  createdAt: Date
}
