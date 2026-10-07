import { Injectable } from '@nestjs/common';
import { BaseCrudService, BaseEntity } from '../common/base-crud.service';

export interface Category extends BaseEntity {
  name: string;
  description?: string;
}

@Injectable()
export class CategoriesService extends BaseCrudService<Category> {
  protected readonly entityName = 'Categoría';
  protected readonly requiredFields = ['name'];
  protected readonly searchFields = ['name', 'description'];

  constructor() {
    super();
    this.seed([
      { name: 'Electrónica', description: 'Computadoras y accesorios' },
      { name: 'Papelería', description: 'Cuadernos, plumas, etc.' },
    ]);
  }
}
