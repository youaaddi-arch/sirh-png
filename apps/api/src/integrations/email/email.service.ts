import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: config.get('SMTP_HOST', 'localhost'),
      port: parseInt(config.get('SMTP_PORT', '1025'), 10),
      secure: false,
      auth: config.get('SMTP_USER') ? {
        user: config.get('SMTP_USER'),
        pass: config.get('SMTP_PASS'),
      } : undefined,
    });
  }

  async send(opts: { to: string; subject: string; text?: string; html?: string }) {
    const from = this.config.get('SMTP_FROM', 'no-reply@sirh-png.local');
    try {
      const info = await this.transporter.sendMail({ from, ...opts });
      this.logger.log(`Email envoyé à ${opts.to} (${opts.subject}) — id ${info.messageId}`);
      return { sent: true, messageId: info.messageId };
    } catch (e) {
      this.logger.warn(`Email failed to ${opts.to}: ${(e as Error).message}`);
      return { sent: false, error: (e as Error).message };
    }
  }

  /**
   * Envoie l'email d'accueil avec identifiants au nouveau salarié.
   */
  async sendOnboardingCredentials(opts: {
    to: string; firstName: string; lastName: string;
    email: string; password: string; webUrl: string;
    tenantName: string;
  }) {
    const html = `
      <h2>Bienvenue chez ${opts.tenantName} !</h2>
      <p>Bonjour ${opts.firstName},</p>
      <p>Votre compte sur notre plateforme RH a été créé. Vous pouvez désormais accéder à votre espace personnel pour :</p>
      <ul>
        <li>Consulter votre contrat et vos bulletins</li>
        <li>Demander des congés</li>
        <li>Pointer vos heures et déposer vos notes de frais</li>
        <li>Suivre vos formations et entretiens</li>
      </ul>
      <p><strong>Vos identifiants de connexion :</strong></p>
      <ul>
        <li>URL : <a href="${opts.webUrl}">${opts.webUrl}</a></li>
        <li>Email : <code>${opts.email}</code></li>
        <li>Mot de passe temporaire : <code>${opts.password}</code></li>
      </ul>
      <p><em>Pour votre sécurité, vous serez invité(e) à changer ce mot de passe lors de votre première connexion.</em></p>
      <p>À très vite,<br/>L'équipe RH</p>
    `;
    return this.send({
      to: opts.to,
      subject: `Bienvenue chez ${opts.tenantName} — vos identifiants d'accès`,
      html,
    });
  }
}
