import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ThrottlerModule } from '@nestjs/throttler'
import { AuthModule } from './auth/auth.module'
import { RecordsModule } from './records/records.module'
import { CommunityModule } from './community/community.module'
import { StatsModule } from './stats/stats.module'
import { User } from './auth/entities/user.entity'
import { Record } from './records/entities/record.entity'
import { Post } from './community/entities/post.entity'
import { PostLike } from './community/entities/post-like.entity'
import { TreeholeModule } from './treehole/treehole.module'
import { Confession } from './treehole/entities/confession.entity'
import { ConfessionVote } from './treehole/entities/confession-vote.entity'
import { HealthController } from './health.controller'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 30 }]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT', 5432),
        database: config.get<string>('DB_DATABASE'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        entities: [User, Record, Post, PostLike, Confession, ConfessionVote],
        synchronize: config.get<string>('NODE_ENV') !== 'production',
      }),
    }),
    AuthModule,
    RecordsModule,
    CommunityModule,
    StatsModule,
    TreeholeModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
