import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { CommunityService } from './community.service'
import { CreatePostDto } from './dto/create-post.dto'
import { AuthGuard } from '../common/guards/auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { User } from '../auth/entities/user.entity'

@ApiTags('社区')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Get('posts')
  @ApiOperation({ summary: '获取社区帖子列表' })
  getPosts(
    @CurrentUser() user: User,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.communityService.getPosts(
      user.id,
      Math.max(1, parseInt(page, 10) || 1),
      Math.min(50, Math.max(1, parseInt(limit, 10) || 20)),
    )
  }

  @Post('posts')
  @ApiOperation({ summary: '发布新帖子' })
  createPost(@CurrentUser() user: User, @Body() dto: CreatePostDto) {
    return this.communityService.createPost(user.id, dto)
  }

  @Post('posts/:id/like')
  @ApiOperation({ summary: '点赞 / 取消点赞' })
  toggleLike(@CurrentUser() user: User, @Param('id') postId: string) {
    return this.communityService.toggleLike(user.id, postId)
  }

  @Get('ranking')
  @ApiOperation({ summary: '获取排行榜' })
  getRanking(@CurrentUser() user: User) {
    return this.communityService.getRanking(user.id)
  }
}
