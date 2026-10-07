import { ConflictException, Injectable } from '@nestjs/common';
import { BaseCrudService, BaseEntity, EntityInput } from '../common/base-crud.service';

export interface User extends BaseEntity {
  name: string;
  email: string;
  role: string;
  active: boolean;
}

@Injectable()
export class UsersService extends BaseCrudService<User> {
  protected readonly entityName = 'Usuario';
  protected readonly requiredFields = ['name', 'email'];
  protected readonly searchFields = ['name', 'email', 'role'];

  constructor() {
    super();
    this.seed([
      { name: 'Ana López', email: 'ana@example.com', role: 'admin' },
      { name: 'Carlos Ruiz', email: 'carlos@example.com' },
    ]);
  }

  protected defaults(): EntityInput {
    return { role: 'user', active: true };
  }

  protected validate(data: EntityInput, currentId?: number): void {
    if (data.email === undefined) return;
    const email = String(data.email).toLowerCase();
    const duplicated = this.items.some(
      (u) => u.email.toLowerCase() === email && u.id !== currentId,
    );
    if (duplicated) {
      throw new ConflictException(`El email ${email} ya está registrado`);
    }
  }

  /** PATCH /api/users/:id/deactivate */
  deactivate(id: number): User {
    const user = this.findOne(id);
    return this.save({ ...user, active: false, updatedAt: new Date().toISOString() });
  }
}
