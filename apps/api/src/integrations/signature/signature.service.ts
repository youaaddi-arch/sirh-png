import { Injectable, Logger } from '@nestjs/common';

/**
 * Service de signature électronique.
 *
 * MVP : mock interne — un clic du signataire = signature horodatée.
 * Migration prévue Phase 2 : Yousign API (eIDAS qualifié).
 */
@Injectable()
export class SignatureService {
  private readonly logger = new Logger(SignatureService.name);

  /**
   * Crée une session de signature mock.
   * En prod : appelle Yousign pour créer une procedure + envoyer email signataire.
   */
  async createSession(opts: { documentPath?: string; signers: Array<{ name: string; email: string; role: string }> }) {
    this.logger.log(`Session signature créée — ${opts.signers.length} signataire(s)`);
    return {
      sessionId: 'mock-' + Math.random().toString(36).slice(2, 12),
      mode: 'mock',
      message: 'Migration Yousign prévue Phase 2 — en MVP, signature simulée',
    };
  }

  /**
   * Enregistre une signature.
   */
  async sign(opts: { signerName: string; signerEmail: string; role: string; ip?: string }) {
    return {
      signedAt: new Date(),
      signedIp: opts.ip,
      proofData: `mock-signature:${opts.role}:${Date.now()}`,
    };
  }
}
