import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, In } from 'typeorm'
import { Record } from './entities/record.entity'
import { CreateRecordDto } from './dto/create-record.dto'

@Injectable()
export class RecordsService {
  constructor(
    @InjectRepository(Record)
    private readonly recordRepo: Repository<Record>,
  ) {}

  async findAll(userId: number): Promise<Record[]> {
    return this.recordRepo.find({
      where: { userId },
      order: { date: 'DESC', createdAt: 'DESC' },
    })
  }

  async create(userId: number, dto: CreateRecordDto): Promise<Record> {
    const exists = await this.recordRepo.findOne({ where: { id: dto.id } })
    if (exists) throw new ConflictException('记录 ID 已存在')
    const record = this.recordRepo.create({ ...dto, userId, note: dto.note ?? '' })
    return this.recordRepo.save(record)
  }

  async remove(userId: number, id: string): Promise<void> {
    const record = await this.recordRepo.findOne({ where: { id, userId } })
    if (!record) throw new NotFoundException('记录不存在')
    await this.recordRepo.remove(record)
  }

  async syncAll(userId: number, records: CreateRecordDto[]): Promise<{ count: number }> {
    if (!records.length) return { count: 0 }
    const ids = records.map(r => r.id)
    const existing = await this.recordRepo.find({ where: { id: In(ids) }, select: ['id'] })
    const existingIds = new Set(existing.map(r => r.id))
    const newRecords = records
      .filter(dto => !existingIds.has(dto.id))
      .map(dto => this.recordRepo.create({ ...dto, userId, note: dto.note ?? '' }))
    if (newRecords.length) {
      await this.recordRepo.save(newRecords)
    }
    return { count: newRecords.length }
  }
}
