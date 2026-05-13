import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm'
import { User } from '../../auth/entities/user.entity'

@Entity('records')
export class Record {
  @PrimaryColumn()
  id: string

  @Column()
  action: string

  @Column()
  target: string

  @Column('float', { default: 0 })
  amount: number

  @Column({ default: 1 })
  simpIndex: number

  @Column()
  date: string

  @Column({ nullable: true, default: '' })
  note: string

  @Column()
  userId: number

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User

  @CreateDateColumn()
  createdAt: Date
}
