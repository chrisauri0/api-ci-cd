import {
  Body,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { BaseCrudService, BaseEntity } from './base-crud.service';

/**
 * Controlador CRUD genérico. Cada recurso que lo extiende obtiene 8 endpoints:
 *
 *   GET    /api/<recurso>            -> lista todo
 *   GET    /api/<recurso>/count      -> total de registros
 *   GET    /api/<recurso>/search?q=  -> búsqueda por texto
 *   GET    /api/<recurso>/:id        -> obtiene uno
 *   POST   /api/<recurso>            -> crea
 *   PUT    /api/<recurso>/:id        -> reemplaza
 *   PATCH  /api/<recurso>/:id        -> actualiza parcial
 *   DELETE /api/<recurso>/:id        -> elimina
 *
 * IMPORTANTE: "count" y "search" se declaran ANTES de ":id"
 * para que Nest no los confunda con un id.
 */
export abstract class BaseCrudController<T extends BaseEntity> {
  protected constructor(protected readonly service: BaseCrudService<T>) {}

  @Get()
  findAll(): T[] {
    return this.service.findAll();
  }

  @Get('count')
  count(): { total: number } {
    return this.service.count();
  }

  @Get('search')
  search(@Query('q') q?: string): T[] {
    return this.service.search(q);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): T {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: unknown): T {
    return this.service.create(body);
  }

  @Put(':id')
  replace(@Param('id', ParseIntPipe) id: number, @Body() body: unknown): T {
    return this.service.replace(id, body);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: unknown): T {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): { deleted: boolean; id: number } {
    return this.service.remove(id);
  }
}
