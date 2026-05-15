import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Todo } from './entities/todo.entity'

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todo)
    private readonly todoRepo: Repository<Todo>,
  ) {}

  async findAll(userId: number): Promise<Todo[]> {
    return this.todoRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    })
  }

  async create(userId: number, title: string, deadline?: Date): Promise<Todo> {
    const todo = this.todoRepo.create({
      userId,
      title,
      deadline,
    })
    return this.todoRepo.save(todo)
  }

  async update(id: number, userId: number, data: Partial<Todo>): Promise<Todo> {
    await this.todoRepo.update({ id, userId }, data)
    return this.todoRepo.findOne({ where: { id, userId } })
  }

  async remove(id: number, userId: number): Promise<void> {
    await this.todoRepo.delete({ id, userId })
  }

  async toggle(id: number, userId: number): Promise<Todo> {
    const todo = await this.todoRepo.findOne({ where: { id, userId } })
    if (todo) {
      todo.completed = !todo.completed
      return this.todoRepo.save(todo)
    }
    return null
  }
}
