import { Body, Controller, Get, Param, Patch, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { PreboardingService } from './preboarding.service';

@ApiTags('preboarding (public)')
@Controller('preboarding')
export class PreboardingController {
  constructor(private service: PreboardingService) {}

  @Get(':token')
  @ApiOperation({ summary: 'Récupère le dossier pré-embauche (PUBLIC, sans auth)' })
  get(@Param('token') token: string) {
    return this.service.getByToken(token);
  }

  @Patch(':token')
  @ApiOperation({ summary: 'Met à jour le brouillon du dossier (auto-save)' })
  saveDraft(@Param('token') token: string, @Body() body: any) {
    return this.service.saveDraft(token, body);
  }

  @Post(':token/documents/:key')
  @ApiOperation({ summary: 'Téléverse une pièce justificative (multipart/form-data)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @Param('token') token: string,
    @Param('key') key: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.uploadDocument(token, key, {
      originalname: file.originalname,
      buffer: file.buffer,
      mimetype: file.mimetype,
      size: file.size,
    });
  }

  @Post(':token/submit')
  @ApiOperation({ summary: 'Soumet le dossier après vérification des pièces obligatoires' })
  submit(@Param('token') token: string) {
    return this.service.submit(token);
  }
}
