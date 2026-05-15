import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { TodoService } from './todo.service'
import { AuthGuard } from '../common/guards/auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { User } from '../auth/entities/user.entity'

@ApiTags('待办')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('todos')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Get()
  @ApiOperation({ summary: '获取待办列表' })
  findAll(@CurrentUser() user: User) {
    return this.todoService.findAll(user.id)
  }

  @Post()
  @ApiOperation({ summary: '创建待办' })
  create(@CurrentUser() user: User, @Body('title') title: string, @Body('deadline') deadline?: Date) {
    return this.todoService.create(user.id, title, deadline)
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新待办' })
  update(@CurrentUser() user: User, @Param('id') id: string, @Body() data: any) {
    return this.todoService.update(+id, user.id, data)
  }

  @Post(':id/toggle')
  @ApiOperation({ summary: '切换待办完成状态' })
  toggle(@CurrentUser() user: User, @Param('id') id: string) {
    return this.todoService.toggle(+id, user.id)
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除待办' })
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.todoService.remove(+id, user.id)
  }
}
