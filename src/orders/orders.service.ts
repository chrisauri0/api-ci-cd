import { BadRequestException, Injectable } from '@nestjs/common';
import { BaseCrudService, BaseEntity, EntityInput } from '../common/base-crud.service';

export const ORDER_STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

export interface Order extends BaseEntity {
  customerId: number;
  total: number;
  status: string;
}

@Injectable()
export class OrdersService extends BaseCrudService<Order> {
  protected readonly entityName = 'Orden';
  protected readonly requiredFields = ['customerId', 'total'];
  protected readonly searchFields = ['status'];

  constructor() {
    super();
    this.seed([{ customerId: 1, total: 16298 }]);
  }

  protected defaults(): EntityInput {
    return { status: 'pending' };
  }

  protected validate(data: EntityInput): void {
    if (data.status !== undefined) {
      this.assertStatus(data.status);
    }
  }

  /** PATCH /api/orders/:id/status  body: { "status": "paid" } */
  changeStatus(id: number, status: unknown): Order {
    const order = this.findOne(id);
    this.assertStatus(status);
    return this.save({
      ...order,
      status: status as string,
      updatedAt: new Date().toISOString(),
    });
  }

  private assertStatus(status: unknown): void {
    if (typeof status !== 'string' || !ORDER_STATUSES.includes(status)) {
      throw new BadRequestException(
        `status inválido. Valores permitidos: ${ORDER_STATUSES.join(', ')}`,
      );
    }
  }
}
