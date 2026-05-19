import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Audit Interceptor — log automatiquement toutes les requêtes mutatives
 * (POST/PATCH/DELETE) avec : qui, quoi, quand, depuis quelle IP.
 *
 * Configurable globalement dans main.ts.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method = req.method;

    // Seules les opérations mutatives sont loguées
    if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(async (result) => {
        try {
          const user = req.user;
          const path = req.url || req.originalUrl || '';
          const tenantId = user?.tenantId || null;
          const userId = user?.sub || null;

          // Extraction grossière du type d'entité depuis l'URL
          const m = path.match(/\/api\/([a-z-]+)/);
          const entityType = m ? m[1] : null;
          const entityId = result?.id || null;

          await this.prisma.auditLog.create({
            data: {
              tenantId, userId,
              action: `${method} ${path}`,
              entityType, entityId,
              ip: req.ip || req.headers['x-forwarded-for'] || null,
              userAgent: req.headers['user-agent'] || null,
            },
          });
        } catch {
          /* on n'interrompt jamais la requête à cause de l'audit */
        }
      }),
    );
  }
}
