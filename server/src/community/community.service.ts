import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, DataSource } from 'typeorm'
import { Post } from './entities/post.entity'
import { PostLike } from './entities/post-like.entity'
import { CreatePostDto } from './dto/create-post.dto'

@Injectable()
export class CommunityService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
    @InjectRepository(PostLike)
    private readonly likeRepo: Repository<PostLike>,
    private readonly dataSource: DataSource,
  ) {}

  async getPosts(userId: number, page = 1, limit = 20): Promise<object[]> {
    const posts = await this.postRepo.find({
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    })
    const likedPostIds = await this.likeRepo
      .find({ where: { userId } })
      .then(likes => likes.map(l => l.postId))

    return posts.map(p => ({
      id: p.id,
      content: p.content,
      likes: p.likes,
      liked: likedPostIds.includes(p.id),
      user: p.user
        ? { nickname: p.user.nickname || '匿名舔友', avatarUrl: p.user.avatarUrl }
        : { nickname: '匿名舔友', avatarUrl: null },
      createdAt: p.createdAt,
    }))
  }

  async createPost(userId: number, dto: CreatePostDto): Promise<Post> {
    const post = this.postRepo.create({ content: dto.content, userId })
    return this.postRepo.save(post)
  }

  async toggleLike(userId: number, postId: string): Promise<{ liked: boolean; likes: number }> {
    return this.dataSource.transaction(async (manager) => {
      const post = await manager.findOne(Post, { where: { id: postId } })
      if (!post) throw new NotFoundException('帖子不存在')

      const existing = await manager.findOne(PostLike, { where: { postId, userId } })
      if (existing) {
        await manager.remove(existing)
        post.likes = Math.max(0, post.likes - 1)
        await manager.save(post)
        return { liked: false, likes: post.likes }
      } else {
        const like = manager.create(PostLike, { postId, userId })
        await manager.save(like)
        post.likes += 1
        await manager.save(post)
        return { liked: true, likes: post.likes }
      }
    })
  }

  async getRanking(userId: number): Promise<object[]> {
    const results = await this.postRepo
      .createQueryBuilder('post')
      .select('post.userId', 'userId')
      .addSelect('SUM(post.likes)', 'totalLikes')
      .addSelect('COUNT(post.id)', 'postCount')
      .groupBy('post.userId')
      .orderBy('totalLikes', 'DESC')
      .getRawMany()

    return results.map((r, i) => ({
      rank: i + 1,
      userId: r.userId,
      totalLikes: Number(r.totalLikes),
      postCount: Number(r.postCount),
      isYou: r.userId === userId,
    }))
  }
}
