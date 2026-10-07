import { Controller } from '@nestjs/common';
import { BaseCrudController } from '../common/base-crud.controller';
import { Note, NotesService } from './notes.service';

@Controller('notes')
export class NotesController extends BaseCrudController<Note> {
  constructor(service: NotesService) {
    super(service);
  }
}
