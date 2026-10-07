import { Controller, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { BaseCrudController } from '../common/base-crud.controller';
import { User, UsersService } from './users.service';

@Controller('users')
export class UsersController extends BaseCrudController<User> {
  constructor(private readonly usersService: UsersService) {
    super(usersService);
  }

  @Patch(':id/deactivate')
  deactivate(@Param('id', ParseIntPipe) id: number): User {
    return this.usersService.deactivate(id);
  }
}
