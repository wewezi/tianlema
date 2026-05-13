import { Entity, PrimaryGeneratedColumn, Column, Unique, CreateDateColumn } from 'typeorm'

@Entity('post_likes')
@Unique(['postId', 'userId'])
export class PostLike {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  postId: string

  @Column()
  userId: number

  @CreateDateColumn()
  createdAt: Date
}
