import { BadRequestException, NotFoundException } from '@nestjs/common';

/** Campos que toda entidad tiene y que el cliente NO puede modificar. */
export interface BaseEntity {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export type EntityInput = Record<string, unknown>;

const PROTECTED_FIELDS = ['id', 'createdAt', 'updatedAt'];

/**
 * Servicio CRUD genérico en memoria.
 * Cada recurso (users, products, ...) lo extiende y solo define
 * su nombre, campos obligatorios, campos de búsqueda y validaciones extra.
 */
export abstract class BaseCrudService<T extends BaseEntity> {
  protected items: T[] = [];
  private nextId = 1;

  protected abstract readonly entityName: string;
  protected abstract readonly requiredFields: string[];
  protected abstract readonly searchFields: string[];

  /** Valores por defecto que se aplican al crear/reemplazar. */
  protected defaults(): EntityInput {
    return {};
  }

  /** Validaciones específicas del recurso (se sobreescribe si hace falta). */
  protected validate(_data: EntityInput, _currentId?: number): void {}

  findAll(): T[] {
    return [...this.items];
  }

  findOne(id: number): T {
    const item = this.items.find((i) => i.id === id);
    if (!item) {
      throw new NotFoundException(
        `${this.entityName} con id ${id} no encontrado`,
      );
    }
    return item;
  }

  count(): { total: number } {
    return { total: this.items.length };
  }

  search(term?: string): T[] {
    if (!term || !term.trim()) {
      throw new BadRequestException('El parámetro "q" es obligatorio');
    }
    const q = term.trim().toLowerCase();
    return this.items.filter((item) =>
      this.searchFields.some((field) => {
        const value = (item as unknown as EntityInput)[field];
        return (
          value !== undefined &&
          value !== null &&
          String(value).toLowerCase().includes(q)
        );
      }),
    );
  }

  create(input: unknown): T {
    const data = this.sanitize(input);
    this.validateRequired(data);
    this.validate(data);
    const now = new Date().toISOString();
    const item = {
      ...this.defaults(),
      ...data,
      id: this.nextId++,
      createdAt: now,
      updatedAt: now,
    } as unknown as T;
    this.items.push(item);
    return item;
  }

  /** PUT: reemplaza el recurso completo (exige campos obligatorios). */
  replace(id: number, input: unknown): T {
    const current = this.findOne(id);
    const data = this.sanitize(input);
    this.validateRequired(data);
    this.validate(data, id);
    const updated = {
      ...this.defaults(),
      ...data,
      id: current.id,
      createdAt: current.createdAt,
      updatedAt: new Date().toISOString(),
    } as unknown as T;
    return this.save(updated);
  }

  /** PATCH: actualiza solo los campos enviados. */
  update(id: number, input: unknown): T {
    const current = this.findOne(id);
    const data = this.sanitize(input);
    if (Object.keys(data).length === 0) {
      throw new BadRequestException('No se enviaron campos para actualizar');
    }
    const emptied = this.requiredFields.filter(
      (f) => f in data && this.isEmpty(data[f]),
    );
    if (emptied.length > 0) {
      throw new BadRequestException(
        `Los campos obligatorios no pueden quedar vacíos: ${emptied.join(', ')}`,
      );
    }
    this.validate(data, id);
    const updated = {
      ...current,
      ...data,
      updatedAt: new Date().toISOString(),
    } as T;
    return this.save(updated);
  }

  remove(id: number): { deleted: boolean; id: number } {
    this.findOne(id);
    this.items = this.items.filter((i) => i.id !== id);
    return { deleted: true, id };
  }

  /** Guarda (sobrescribe) un item existente. */
  protected save(item: T): T {
    const index = this.items.findIndex((i) => i.id === item.id);
    this.items[index] = item;
    return item;
  }

  /** Datos iniciales para que la API no arranque vacía. */
  protected seed(records: EntityInput[]): void {
    records.forEach((record) => this.create(record));
  }

  protected sanitize(input: unknown): EntityInput {
    if (input === null || typeof input !== 'object' || Array.isArray(input)) {
      throw new BadRequestException(
        'El cuerpo de la petición debe ser un objeto JSON',
      );
    }
    const data: EntityInput = {};
    for (const [key, value] of Object.entries(input as EntityInput)) {
      if (!PROTECTED_FIELDS.includes(key)) {
        data[key] = value;
      }
    }
    return data;
  }

  protected validateRequired(data: EntityInput): void {
    const missing = this.requiredFields.filter((f) => this.isEmpty(data[f]));
    if (missing.length > 0) {
      throw new BadRequestException(
        `Campos obligatorios faltantes: ${missing.join(', ')}`,
      );
    }
  }

  protected isEmpty(value: unknown): boolean {
    return (
      value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim() === '')
    );
  }
}
