import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(() => {
    service = new UsersService();
  });

  it('carga datos semilla con defaults', () => {
    const users = service.findAll();
    expect(users.length).toBeGreaterThanOrEqual(2);
    expect(users[1]).toMatchObject({ role: 'user', active: true });
  });

  it('no permite emails duplicados (sin importar mayúsculas)', () => {
    expect(() =>
      service.create({ name: 'Otra Ana', email: 'ANA@example.com' }),
    ).toThrow(ConflictException);
  });

  it('permite conservar su propio email al editar', () => {
    const user = service.create({ name: 'Pepe', email: 'pepe@example.com' });
    expect(
      service.replace(user.id, { name: 'Pepe 2', email: 'pepe@example.com' }),
    ).toMatchObject({ name: 'Pepe 2' });
    expect(service.update(user.id, { name: 'Pepe 3' })).toMatchObject({
      name: 'Pepe 3',
    });
  });

  it('no permite cambiar a un email de otro usuario', () => {
    const user = service.create({ name: 'Pepe', email: 'pepe@example.com' });
    expect(() => service.update(user.id, { email: 'ana@example.com' })).toThrow(
      ConflictException,
    );
  });

  it('desactiva un usuario', () => {
    expect(service.deactivate(1)).toMatchObject({ id: 1, active: false });
    expect(() => service.deactivate(999)).toThrow(NotFoundException);
  });
});
