import { Controller } from '@nestjs/common';
import { BaseCrudController } from '../common/base-crud.controller';
import { Customer, CustomersService } from './customers.service';

@Controller('customers')
export class CustomersController extends BaseCrudController<Customer> {
  constructor(service: CustomersService) {
    super(service);
  }
}
