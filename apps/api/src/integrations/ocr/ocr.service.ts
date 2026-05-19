import { Injectable, Logger } from '@nestjs/common';

/**
 * Service OCR — Sprint 2 / Phase 2.2.
 *
 * MVP : stub qui retourne un échantillon de données.
 * Phase 2.2 : implémentation Tesseract.js réelle pour extraire :
 *   - Pièce d'identité : civilité, nom, prénom, date et lieu de naissance, nationalité
 *   - Carte vitale   : numéro de sécurité sociale (13 chiffres + clé)
 *   - RIB            : IBAN, BIC, banque
 *   - Justificatif domicile : adresse, code postal, ville
 */
@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);

  async extract(docKey: string, buffer: Buffer): Promise<Record<string, any>> {
    this.logger.log(`OCR demandé sur "${docKey}" (${buffer.length} bytes)`);
    // À activer Phase 2.2
    // const { recognize } = await import('tesseract.js');
    // const result = await recognize(buffer, 'fra');
    // return this.parseByDocType(docKey, result.data.text);
    return {
      _stub: true,
      _message: 'OCR sera activé en Phase 2.2 avec Tesseract.js',
      docKey,
    };
  }
}
