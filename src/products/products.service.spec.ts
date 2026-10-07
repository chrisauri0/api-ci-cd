import { BadRequestException } from '@nestjs/common';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(() => {
    service = new ProductsService();
  });

  it('aplica stock 0 por defecto', () => {
    expect(service.create({ name: 'Cable', price: 50 })).toMatchObject({ stock: 0 });
  });

  it.each([
    [{ name: 'X', price: -1 }],
    [{ name: 'X', price: 'gratis' }],
    [{ name: 'X', price: 10, stock: -3 }],
    [{ name: 'X', price: 10, stock: 1.5 }],
  ])('valida precio y stock: %p', (body) => {
    expect(() => service.create(body)).toThrow(BadRequestException);
  });

  it('lista productos con poco stock', () => {
    service.create({ name: 'Teclado', price: 500, stock: 1 });
    const low = service.lowStock(3);
    expect(low.every((p) => p.stock <= 3)).toBe(true);
    expect(low.map((p) => p.name)).toEqual(expect.arrayContaining(['Mouse', 'Teclado']));
    expect(service.lowStock()).toEqual(low);
  });

  it('ajusta el stock', () => {
    expect(service.adjustStock(1, 5)).toMatchObject({ stock: 15 });
    expect(service.adjustStock(1, -15)).toMatchObject({ stock: 0 });
  });

  it('no permite stock negativo ni cantidades inválidas', () => {
    expect(() => service.adjustStock(2, -100)).toThrow(BadRequestException);
    expect(() => service.adjustStock(2, '2')).toThrow(BadRequestException);
    expect(() => service.adjustStock(2, 1.5)).toThrow(BadRequestException);
  });
});
