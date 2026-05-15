import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { RecordsService } from './records.service'
import { CreateRecordDto } from './dto/create-record.dto'
import { AuthGuard } from '../common/guards/auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { User } from '../auth/entities/user.entity'

@ApiTags('深情记录')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('records')
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Get()
  @ApiOperation({ summary: '获取当前用户所有记录' })
  findAll(@CurrentUser() user: User) {
    return this.recordsService.findAll(user.id)
  }

  @Post()
  @ApiOperation({ summary: '新增一条记录' })
  create(@CurrentUser() user: User, @Body() dto: CreateRecordDto) {
    return this.recordsService.create(user.id, dto)
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除指定记录' })
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.recordsService.remove(user.id, id)
  }

  @Post('sync')
  @ApiOperation({ summary: '批量同步本地记录到服务器' })
  sync(@CurrentUser() user: User, @Body() body: { records: CreateRecordDto[] }) {
    return this.recordsService.syncAll(user.id, body.records)
  }

  @Delete()
  @ApiOperation({ summary: '清空当前用户所有记录' })
  clearAll(@CurrentUser() user: User) {
    return this.recordsService.clearAll(user.id)
  }
}
