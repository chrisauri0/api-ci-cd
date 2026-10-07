import { Body, Controller, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { BaseCrudController } from '../common/base-crud.controller';
import { Order, OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController extends BaseCrudController<Order> {
  constructor(private readonly ordersService: OrdersService) {
    super(ordersService);
  }

  @Patch(':id/status')
  changeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: unknown,
  ): Order {
    return this.ordersService.changeStatus(id, status);
  }
}
