import { BadRequestException } from '@nestjs/common';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(() => {
    service = new OrdersService();
  });

  it('crea órdenes con status pending por defecto', () => {
    expect(service.create({ customerId: 1, total: 100 })).toMatchObject({
      status: 'pending',
    });
  });

  it('acepta status válido al crear y rechaza inválido', () => {
    expect(service.create({ customerId: 1, total: 1, status: 'paid' })).toMatchObject({
      status: 'paid',
    });
    expect(() =>
      service.create({ customerId: 1, total: 1, status: 'perdida' }),
    ).toThrow(BadRequestException);
  });

  it('cambia el status de una orden', () => {
    expect(service.changeStatus(1, 'shipped')).toMatchObject({ status: 'shipped' });
    expect(() => service.changeStatus(1, 'volando')).toThrow(BadRequestException);
    expect(() => service.changeStatus(1, undefined)).toThrow(BadRequestException);
  });
});
