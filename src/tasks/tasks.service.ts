import { Injectable } from '@nestjs/common';
import { BaseCrudService, BaseEntity, EntityInput } from '../common/base-crud.service';

export interface Task extends BaseEntity {
  title: string;
  description?: string;
  priority: string;
  completed: boolean;
}

@Injectable()
export class TasksService extends BaseCrudService<Task> {
  protected readonly entityName = 'Tarea';
  protected readonly requiredFields = ['title'];
  protected readonly searchFields = ['title', 'description'];

  constructor() {
    super();
    this.seed([
      { title: 'Configurar pipeline', description: 'GitHub Actions + Docker' },
      { title: 'Desplegar en EC2', priority: 'high' },
    ]);
  }

  protected defaults(): EntityInput {
    return { priority: 'medium', completed: false };
  }

  /** GET /api/tasks/pending */
  pending(): Task[] {
    return this.items.filter((t) => !t.completed);
  }

  /** PATCH /api/tasks/:id/complete */
  complete(id: number): Task {
    const task = this.findOne(id);
    return this.save({ ...task, completed: true, updatedAt: new Date().toISOString() });
  }
}
