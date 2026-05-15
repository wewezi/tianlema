import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { RecordsService } from '../records/records.service'
import { User } from '../auth/entities/user.entity'
import { Record as RecordEntity } from '../records/entities/record.entity'

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
}
