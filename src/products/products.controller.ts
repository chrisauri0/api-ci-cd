import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { BaseCrudController } from '../common/base-crud.controller';
import { Product, ProductsService } from './products.service';

@Controller('products')
export class ProductsController extends BaseCrudController<Product> {
  constructor(private readonly productsService: ProductsService) {
    super(productsService);
  }

  @Get('low-stock')
  lowStock(
    @Query('max', new DefaultValuePipe(5), ParseIntPipe) max: number,
  ): Product[] {
    return this.productsService.lowStock(max);
  }

  @Patch(':id/stock')
  adjustStock(
    @Param('id', ParseIntPipe) id: number,
    @Body('quantity') quantity: unknown,
  ): Product {
    return this.productsService.adjustStock(id, quantity);
  }
}
