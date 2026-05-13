import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { StatsController } from './stats.controller'
import { StatsService } from './stats.service'
import { RecordsModule } from '../records/records.module'
import { AuthModule } from '../auth/auth.module'
import { User } from '../auth/entities/user.entity'
import { Record } from '../records/entities/record.entity'

@Module({
  imports: [RecordsModule, AuthModule, TypeOrmModule.forFeature([User, Record])],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
