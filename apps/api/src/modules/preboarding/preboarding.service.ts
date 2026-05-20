import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { StorageService } from '../../integrations/storage/storage.service';
import { OcrService } from '../../integrations/ocr/ocr.service';

const REQUIRED_DOCS = ['cv', 'id_card', 'vital_card', 'rib', 'residence_proof'];

@Injectable()
export class PreboardingService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    private ocr: OcrService,
  ) {}

  async getByToken(token: string) {
    const p = await this.prisma.hireProcess.findUnique({
      where: { token },
      include: {
        tenant: { select: { id: true, code: true, name: true, address: true } },
        documents: { select: { id: true, key: true, filename: true, size: true, uploadedAt: true } },
      },
    });
    if (!p) throw new NotFoundException('Lien invalide ou expiré');
    if (p.expiresAt && p.expiresAt < new Date()) throw new BadRequestException('Lien expiré');
    // On masque les données sensibles internes
    const { history, ocrExtracted, ...safe } = p as any;
    return safe;
  }

  async saveDraft(token: string, data: any) {
    const p = await this.getByToken(token);
    if (p.status !== 'pre_embauche') throw new BadRequestException('Ce dossier est déjà soumis ou clôturé');
    return this.prisma.hireProcess.update({
      where: { id: p.id },
      data: { draftData: { ...(p.draftData as any || {}), ...data } as any },
    });
  }

  async uploadDocument(token: string, key: string, file: { originalname: string; buffer: Buffer; mimetype: string; size: number }) {
    const p = await this.getByToken(token);
    if (p.status !== 'pre_embauche') throw new BadRequestException('Le dossier est déjà soumis');
    if (file.size > 5 * 1024 * 1024) throw new BadRequestException('Fichier > 5 Mo');
    if (!['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'].includes(file.mimetype)) {
      throw new BadRequestException('Format non autorisé (PDF, JPG, PNG uniquement)');
    }

    // Supprime un éventuel doc existant de même key
    const prev = await this.prisma.hireProcessDocument.findFirst({ where: { hireProcessId: p.id, key } });
    if (prev) {
      await this.storage.delete(prev.storagePath).catch(() => {});
      await this.prisma.hireProcessDocument.delete({ where: { id: prev.id } });
    }

    const { path } = await this.storage.upload('sirh-preboarding', file.originalname, file.buffer);
    const doc = await this.prisma.hireProcessDocument.create({
      data: {
        hireProcessId: p.id, key,
        filename: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        storagePath: path,
      },
    });

    // OCR auto sur cartes d'identité et carte vitale
    if (['id_card', 'vital_card'].includes(key)) {
      const extracted = await this.ocr.extract(key, file.buffer);
      await this.prisma.hireProcess.update({
        where: { id: p.id },
        data: {
          ocrExtracted: { ...(p.ocrExtracted as any || {}), [key]: extracted } as any,
        },
      });
    }
    return doc;
  }

  async submit(token: string) {
    const p = await this.getByToken(token);
    if (p.status !== 'pre_embauche') throw new BadRequestException('Dossier déjà soumis');
    const docs = await this.prisma.hireProcessDocument.findMany({ where: { hireProcessId: p.id } });
    const present = new Set(docs.map((d) => d.key));
    const missing = REQUIRED_DOCS.filter((k) => !present.has(k));
    if (missing.length) throw new BadRequestException(`Pièces manquantes : ${missing.join(', ')}`);
    return this.prisma.hireProcess.update({
      where: { id: p.id },
      data: {
        status: 'soumis',
        submittedAt: new Date(),
        history: [...(p.history as any[] || []), {
          at: new Date().toISOString(),
          by: 'candidate',
          action: 'Dossier soumis par le candidat',
        }] as any,
      },
    });
  }
}
