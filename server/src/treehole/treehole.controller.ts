import { Controller, Get, Post, Put, Body, Param, UseGuards, BadRequestException } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { TreeholeService } from './treehole.service'
import { CreateConfessionDto } from './dto/create-confession.dto'
import { AuthGuard } from '../common/guards/auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { User } from '../auth/entities/user.entity'

@ApiTags('树洞')
@Controller('treehole')
export class TreeholeController {
  constructor(private readonly treeholeService: TreeholeService) {}

  @Get()
  @ApiOperation({ summary: '获取树洞列表' })
  findAll() {
    return this.treeholeService.findAll()
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '匿名发布故事' })
  create(@Body() dto: CreateConfessionDto, @CurrentUser() user: User) {
    return this.treeholeService.create(dto, user?.id)
  }

  @Put(':id/vote')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '投票：sympathy 或 deserved' })
  vote(
    @Param('id') id: string,
    @Body('type') type: 'sympathy' | 'deserved',
    @CurrentUser() user: User,
  ) {
    if (!['sympathy', 'deserved'].includes(type)) {
      throw new BadRequestException('type 必须是 sympathy 或 deserved')
    }
    return this.treeholeService.vote(id, type, user.id)
  }
}
