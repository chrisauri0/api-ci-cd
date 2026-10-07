import { Controller, Get, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { BaseCrudController } from '../common/base-crud.controller';
import { Task, TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController extends BaseCrudController<Task> {
  constructor(private readonly tasksService: TasksService) {
    super(tasksService);
  }

  @Get('pending')
  pending(): Task[] {
    return this.tasksService.pending();
  }

  @Patch(':id/complete')
  complete(@Param('id', ParseIntPipe) id: number): Task {
    return this.tasksService.complete(id);
  }
}
