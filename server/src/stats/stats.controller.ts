import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { StatsService } from './stats.service'
import { AuthGuard } from '../common/guards/auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { User } from '../auth/entities/user.entity'

@ApiTags('统计')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  @ApiOperation({ summary: '获取当前用户舔狗统计数据' })
  getStats(@CurrentUser() user: User) {
    return this.statsService.getStats(user.id)
  }

  @Get('ranking')
  @ApiOperation({ summary: '获取全服舔狗排行榜' })
  getRanking(@CurrentUser() user: User) {
    return this.statsService.getRanking(user.id)
  }
}
