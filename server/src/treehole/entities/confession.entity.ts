import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { User } from '../../auth/entities/user.entity'

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

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User

  @Column('simple-json', { nullable: true })
  images: string[]

  @CreateDateColumn()
  createdAt: Date
}
