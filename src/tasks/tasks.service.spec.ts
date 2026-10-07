import { NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(() => {
    service = new TasksService();
  });

  it('crea tareas con prioridad media y sin completar', () => {
    expect(service.create({ title: 'Nueva' })).toMatchObject({
      priority: 'medium',
      completed: false,
    });
  });

  it('completa tareas y las saca de pendientes', () => {
    const before = service.pending().length;
    expect(service.complete(1)).toMatchObject({ completed: true });
    expect(service.pending()).toHaveLength(before - 1);
    expect(() => service.complete(999)).toThrow(NotFoundException);
  });
});
