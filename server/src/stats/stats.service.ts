import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { RecordsService } from '../records/records.service'
import { User } from '../auth/entities/user.entity'
import { Record as RecordEntity } from '../records/entities/record.entity'

const RANK_TITLES: { score: number; title: string; icon: string }[] = [
  { score: 0, title: '初入舔途', icon: '🐣' },
  { score: 300, title: '见习舔狗', icon: '🐕' },
  { score: 1000, title: '资深舔狗', icon: '🐩' },
  { score: 3000, title: '舔界精英', icon: '🦮' },
  { score: 8000, title: '舔中之王', icon: '🐕‍🦺' },
  { score: 25000, title: '舔了吗终身会员', icon: '👑' },
]

function getRankTitle(score: number): string {
  let title = RANK_TITLES[0].title
  for (let i = RANK_TITLES.length - 1; i >= 0; i--) {
    if (score >= RANK_TITLES[i].score) {
      title = RANK_TITLES[i].title
      break
    }
  }
  return title
}

function getRankIcon(score: number): string {
  let icon = RANK_TITLES[0].icon
  for (let i = RANK_TITLES.length - 1; i >= 0; i--) {
    if (score >= RANK_TITLES[i].score) {
      icon = RANK_TITLES[i].icon
      break
    }
  }
  return icon
}

@Injectable()
export class StatsService {
  constructor(
    private readonly recordsService: RecordsService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(RecordEntity)
    private readonly recordRepo: Repository<RecordEntity>,
  ) {}

  async getStats(userId: number) {
    const records = await this.recordsService.findAll(userId)

    if (records.length === 0) {
      return {
        totalEvents: 0,
        totalAmount: 0,
        avgSimp: 0,
        targetCount: 0,
        score: 0,
        topTargets: [],
        topActions: [],
      }
    }

    const totalAmount = records.reduce((s, r) => s + r.amount, 0)
    const avgSimp = records.reduce((s, r) => s + r.simpIndex, 0) / records.length
    const uniqueTargets = new Set(records.map(r => r.target)).size
    const score = records.reduce((s, r) => s + r.amount * 10 + r.simpIndex * 20, 0)

    const targetMap: Record<string, { count: number; total: number }> = {}
    const actionMap: Record<string, number> = {}

    for (const r of records) {
      if (!targetMap[r.target]) targetMap[r.target] = { count: 0, total: 0 }
      targetMap[r.target].count++
      targetMap[r.target].total += r.amount
      actionMap[r.action] = (actionMap[r.action] || 0) + 1
    }

    const topTargets = Object.entries(targetMap)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([name, data]) => ({ name, count: data.count, total: data.total }))

    const topActions = Object.entries(actionMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))

    return {
      totalEvents: records.length,
      totalAmount,
      avgSimp: Number(avgSimp.toFixed(1)),
      targetCount: uniqueTargets,
      score,
      topTargets,
      topActions,
    }
  }

  async getRanking(userId: number) {
    const results = await this.recordRepo
      .createQueryBuilder('r')
      .select('r.userId', 'userId')
      .addSelect('COALESCE(SUM(r.amount * 10 + r.simpIndex * 20), 0)', 'score')
      .groupBy('r.userId')
      .orderBy('score', 'DESC')
      .getRawMany()

    const userIds = results.map((r: any) => Number(r.userId))
    const users = userIds.length > 0
      ? await this.userRepo.findByIds(userIds)
      : []
    const userMap = new Map(users.map(u => [u.id, u]))

    return results.map((r: any, i: number) => {
      const score = Math.round(Number(r.score))
      const user = userMap.get(Number(r.userId))
      return {
        rank: i + 1,
        userId: Number(r.userId),
        nickname: user?.nickname || '匿名舔友',
        avatar: getRankIcon(score),
        title: getRankTitle(score),
        score,
        isYou: Number(r.userId) === userId,
      }
    })
  }
}
