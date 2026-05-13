import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Confession } from './entities/confession.entity'
import { ConfessionVote } from './entities/confession-vote.entity'
import { TreeholeController } from './treehole.controller'
import { TreeholeService } from './treehole.service'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [TypeOrmModule.forFeature([Confession, ConfessionVote]), AuthModule],
  controllers: [TreeholeController],
  providers: [TreeholeService],
})
export class TreeholeModule {}
