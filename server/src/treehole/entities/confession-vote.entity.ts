import { Entity, PrimaryGeneratedColumn, Column, Unique, CreateDateColumn } from 'typeorm'

@Entity('confession_votes')
@Unique(['confessionId', 'userId'])
export class ConfessionVote {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  confessionId: string

  @Column()
  userId: number

  @Column()
  type: string

  @CreateDateColumn()
  createdAt: Date
}
