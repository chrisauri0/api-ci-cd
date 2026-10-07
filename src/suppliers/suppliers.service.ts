import { Injectable } from '@nestjs/common';
import { BaseCrudService, BaseEntity } from '../common/base-crud.service';

export interface Supplier extends BaseEntity {
  name: string;
  contact?: string;
  phone?: string;
}

@Injectable()
export class SuppliersService extends BaseCrudService<Supplier> {
  protected readonly entityName = 'Proveedor';
  protected readonly requiredFields = ['name'];
  protected readonly searchFields = ['name', 'contact'];

  constructor() {
    super();
    this.seed([
      { name: 'Distribuidora del Bajío', contact: 'Luis Hernández' },
    ]);
  }
}
