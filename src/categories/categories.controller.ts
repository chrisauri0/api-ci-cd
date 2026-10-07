import { Controller } from '@nestjs/common';
import { BaseCrudController } from '../common/base-crud.controller';
import { Category, CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController extends BaseCrudController<Category> {
  constructor(service: CategoriesService) {
    super(service);
  }
}
