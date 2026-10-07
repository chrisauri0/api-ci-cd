import { Injectable } from '@nestjs/common';
import { BaseCrudService, BaseEntity } from '../common/base-crud.service';

export interface Note extends BaseEntity {
  title: string;
  content: string;
}

@Injectable()
export class NotesService extends BaseCrudService<Note> {
  protected readonly entityName = 'Nota';
  protected readonly requiredFields = ['title', 'content'];
  protected readonly searchFields = ['title', 'content'];

  constructor() {
    super();
    this.seed([
      { title: 'Bienvenida', content: 'Primera nota de la API' },
    ]);
  }
}
