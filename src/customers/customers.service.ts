import { Injectable } from '@nestjs/common';
import { BaseCrudService, BaseEntity } from '../common/base-crud.service';

export interface Customer extends BaseEntity {
  name: string;
  email: string;
  phone?: string;
}

@Injectable()
export class CustomersService extends BaseCrudService<Customer> {
  protected readonly entityName = 'Cliente';
  protected readonly requiredFields = ['name', 'email'];
  protected readonly searchFields = ['name', 'email', 'phone'];

  constructor() {
    super();
    this.seed([
      { name: 'María Pérez', email: 'maria@example.com', phone: '4421234567' },
    ]);
  }
}
