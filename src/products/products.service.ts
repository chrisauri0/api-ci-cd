import { BadRequestException, Injectable } from '@nestjs/common';
import { BaseCrudService, BaseEntity, EntityInput } from '../common/base-crud.service';

export interface Product extends BaseEntity {
  name: string;
  price: number;
  stock: number;
  categoryId?: number;
}

@Injectable()
export class ProductsService extends BaseCrudService<Product> {
  protected readonly entityName = 'Producto';
  protected readonly requiredFields = ['name', 'price'];
  protected readonly searchFields = ['name'];

  constructor() {
    super();
    this.seed([
      { name: 'Laptop', price: 15999, stock: 10, categoryId: 1 },
      { name: 'Mouse', price: 299, stock: 3, categoryId: 1 },
    ]);
  }

  protected defaults(): EntityInput {
    return { stock: 0 };
  }

  protected validate(data: EntityInput): void {
    if (data.price !== undefined && (typeof data.price !== 'number' || data.price < 0)) {
      throw new BadRequestException('price debe ser un número mayor o igual a 0');
    }
    if (
      data.stock !== undefined &&
      (!Number.isInteger(data.stock) || (data.stock as number) < 0)
    ) {
      throw new BadRequestException('stock debe ser un entero mayor o igual a 0');
    }
  }

  /** GET /api/products/low-stock?max=5 */
  lowStock(max = 5): Product[] {
    return this.items.filter((p) => p.stock <= max);
  }

  /** PATCH /api/products/:id/stock  body: { "quantity": -2 } */
  adjustStock(id: number, quantity: unknown): Product {
    const product = this.findOne(id);
    if (typeof quantity !== 'number' || !Number.isInteger(quantity)) {
      throw new BadRequestException('quantity debe ser un número entero');
    }
    const stock = product.stock + quantity;
    if (stock < 0) {
      throw new BadRequestException('No hay suficiente stock');
    }
    return this.save({ ...product, stock, updatedAt: new Date().toISOString() });
  }
}
