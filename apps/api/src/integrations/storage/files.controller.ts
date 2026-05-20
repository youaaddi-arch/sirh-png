import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { StorageService } from './storage.service';

@ApiTags('files')
@Controller('files')
export class FilesController {
  constructor(private storage: StorageService) {}

  @Get(':path')
  async download(@Param('path') storagePath: string, @Res() res: Response) {
    try {
      const buffer = await this.storage.download(decodeURIComponent(storagePath));
      res.setHeader('Content-Disposition', 'inline');
      res.send(buffer);
    } catch {
      throw new NotFoundException('Fichier introuvable');
    }
  }
}
