import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CommunityController } from './community.controller'
import { CommunityService } from './community.service'
import { Post } from './entities/post.entity'
import { PostLike } from './entities/post-like.entity'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [TypeOrmModule.forFeature([Post, PostLike]), AuthModule],
  controllers: [CommunityController],
  providers: [CommunityService],
})
export class CommunityModule {}
