import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, DataSource } from 'typeorm'
import { Confession } from './entities/confession.entity'
import { ConfessionVote } from './entities/confession-vote.entity'
import { CreateConfessionDto } from './dto/create-confession.dto'

@Injectable()
export class TreeholeService {
  constructor(
    @InjectRepository(Confession)
    private readonly confessionRepo: Repository<Confession>,
    @InjectRepository(ConfessionVote)
    private readonly voteRepo: Repository<ConfessionVote>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateConfessionDto, userId?: number): Promise<Confession> {
    const confession = this.confessionRepo.create({
      content: dto.content,
      images: dto.images || [],
      userId: userId || null,
    })
    return this.confessionRepo.save(confession)
  }

  async findAll(): Promise<Confession[]> {
    return this.confessionRepo.find({
      order: { createdAt: 'DESC' },
      relations: ['user'],
      take: 50,
    })
  }

  async vote(id: string, type: 'sympathy' | 'deserved', userId: number): Promise<Confession> {
    return this.dataSource.transaction(async (manager) => {
      const confession = await manager.findOne(Confession, { where: { id } })
      if (!confession) throw new NotFoundException('不存在')

      const existing = await manager.findOne(ConfessionVote, {
        where: { confessionId: id, userId },
      })
      if (existing) throw new ConflictException('你已经投过票了')

      const vote = manager.create(ConfessionVote, { confessionId: id, userId, type })
      await manager.save(vote)

      if (type === 'sympathy') {
        confession.sympathy++
      } else {
        confession.deserved++
      }
      return manager.save(confession)
    })
  }

  async remove(id: string, userId: number): Promise<void> {
    const confession = await this.confessionRepo.findOne({ where: { id } })
    if (!confession) throw new NotFoundException('不存在')
    if (confession.userId !== userId) {
      throw new ForbiddenException('只能删除自己的发布')
    }
    await this.confessionRepo.remove(confession)
  }
}
