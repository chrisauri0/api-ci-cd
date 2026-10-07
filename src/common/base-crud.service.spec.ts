import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BaseCrudService, BaseEntity, EntityInput } from './base-crud.service';

interface Item extends BaseEntity {
  name: string;
  tag?: string;
  active: boolean;
}

class ItemsService extends BaseCrudService<Item> {
  protected readonly entityName = 'Item';
  protected readonly requiredFields = ['name'];
  protected readonly searchFields = ['name', 'tag'];

  protected defaults(): EntityInput {
    return { active: true };
  }
}

/** Servicio sin defaults() ni validate() para cubrir la implementación base */
class PlainService extends BaseCrudService<Item> {
  protected readonly entityName = 'Plain';
  protected readonly requiredFields = ['name'];
  protected readonly searchFields = ['name'];
}

describe('BaseCrudService', () => {
  let service: ItemsService;

  beforeEach(() => {
    service = new ItemsService();
  });

  it('empieza vacío', () => {
    expect(service.findAll()).toEqual([]);
    expect(service.count()).toEqual({ total: 0 });
  });

  describe('create', () => {
    it('crea con id autoincremental, fechas y defaults', () => {
      const a = service.create({ name: 'A' });
      const b = service.create({ name: 'B', active: false });
      expect(a).toMatchObject({ id: 1, name: 'A', active: true });
      expect(b).toMatchObject({ id: 2, name: 'B', active: false });
      expect(a.createdAt).toBeDefined();
      expect(a.updatedAt).toBe(a.createdAt);
      expect(service.count()).toEqual({ total: 2 });
    });

    it('ignora campos protegidos (id, createdAt, updatedAt)', () => {
      const item = service.create({ name: 'A', id: 99, createdAt: 'x' });
      expect(item.id).toBe(1);
      expect(item.createdAt).not.toBe('x');
    });

    it.each([[{}], [{ name: '' }], [{ name: '   ' }], [{ name: null }]])(
      'falla si falta un campo obligatorio: %p',
      (body) => {
        expect(() => service.create(body)).toThrow(BadRequestException);
      },
    );

    it.each([[null], [undefined], ['texto'], [42], [[{ name: 'A' }]]])(
      'falla si el body no es un objeto: %p',
      (body) => {
        expect(() => service.create(body)).toThrow(BadRequestException);
      },
    );

    it('funciona sin defaults() ni validate() sobreescritos', () => {
      const plain = new PlainService();
      expect(plain.create({ name: 'P' })).toMatchObject({ id: 1, name: 'P' });
    });
  });

  describe('findOne', () => {
    it('regresa el item', () => {
      const created = service.create({ name: 'A' });
      expect(service.findOne(created.id)).toEqual(created);
    });

    it('lanza 404 si no existe', () => {
      expect(() => service.findOne(123)).toThrow(NotFoundException);
    });
  });

  describe('search', () => {
    beforeEach(() => {
      service.create({ name: 'Laptop Gamer', tag: 'tech' });
      service.create({ name: 'Cuaderno', tag: 'papeleria' });
      service.create({ name: 'Mouse' });
    });

    it('busca sin importar mayúsculas en varios campos', () => {
      expect(service.search('LAPTOP')).toHaveLength(1);
      expect(service.search('tech')).toHaveLength(1);
      expect(service.search('o')).toHaveLength(3);
      expect(service.search('zzz')).toHaveLength(0);
    });

    it.each([[undefined], [''], ['   ']])('exige el término q: %p', (q) => {
      expect(() => service.search(q)).toThrow(BadRequestException);
    });
  });

  describe('replace (PUT)', () => {
    it('reemplaza todo y conserva id y createdAt', () => {
      const created = service.create({ name: 'A', tag: 'viejo', active: false });
      const replaced = service.replace(created.id, { name: 'B' });
      expect(replaced).toMatchObject({ id: created.id, name: 'B', active: true });
      expect(replaced.tag).toBeUndefined();
      expect(replaced.createdAt).toBe(created.createdAt);
      expect(service.findOne(created.id)).toEqual(replaced);
    });

    it('valida obligatorios y existencia', () => {
      const created = service.create({ name: 'A' });
      expect(() => service.replace(created.id, {})).toThrow(BadRequestException);
      expect(() => service.replace(999, { name: 'X' })).toThrow(NotFoundException);
    });
  });

  describe('update (PATCH)', () => {
    it('actualiza solo los campos enviados', () => {
      const created = service.create({ name: 'A', tag: 't' });
      const updated = service.update(created.id, { tag: 'nuevo' });
      expect(updated).toMatchObject({ id: created.id, name: 'A', tag: 'nuevo' });
    });

    it('rechaza body vacío o dejar obligatorios vacíos', () => {
      const created = service.create({ name: 'A' });
      expect(() => service.update(created.id, {})).toThrow(BadRequestException);
      expect(() => service.update(created.id, { id: 5 })).toThrow(BadRequestException);
      expect(() => service.update(created.id, { name: '' })).toThrow(BadRequestException);
    });

    it('lanza 404 si no existe', () => {
      expect(() => service.update(999, { name: 'X' })).toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('elimina el item', () => {
      const created = service.create({ name: 'A' });
      expect(service.remove(created.id)).toEqual({ deleted: true, id: created.id });
      expect(service.count()).toEqual({ total: 0 });
      expect(() => service.findOne(created.id)).toThrow(NotFoundException);
    });

    it('lanza 404 si no existe', () => {
      expect(() => service.remove(1)).toThrow(NotFoundException);
    });
  });
});
