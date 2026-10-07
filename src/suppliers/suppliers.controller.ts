import { Controller } from '@nestjs/common';
import { BaseCrudController } from '../common/base-crud.controller';
import { Supplier, SuppliersService } from './suppliers.service';

@Controller('suppliers')
export class SuppliersController extends BaseCrudController<Supplier> {
  constructor(service: SuppliersService) {
    super(service);
  }
}
