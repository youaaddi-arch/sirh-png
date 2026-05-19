/**
 * Tests E2E du module Hiring + Preboarding — Sprint 2
 */
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Hiring + Preboarding (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let createdHire: any;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@pn-groupe.fr', password: 'Admin2026!' });
    token = login.body.token;
  });

  afterAll(async () => { await app.close(); });

  it('GET /hire-processes — vide ou peuplé', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/hire-processes')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /hire-processes — crée un dossier d\'embauche', async () => {
    const tenants = await request(app.getHttpServer())
      .get('/api/tenants').set('Authorization', `Bearer ${token}`);
    const t = tenants.body[0];

    const res = await request(app.getHttpServer())
      .post('/api/hire-processes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        tenantId: t.id,
        firstName: 'Jean', lastName: 'Test',
        email: `test-${Date.now()}@example.com`,
        jobTitle: 'Développeur Web',
        contractType: 'CDI', statusClass: 'Cadre',
        grossSalary: 3500, startDate: '2026-09-01',
      });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.status).toBe('pre_embauche');
    createdHire = res.body;
  });

  it('GET /preboarding/:token — endpoint public (pas d\'auth)', async () => {
    if (!createdHire) return;
    const res = await request(app.getHttpServer())
      .get(`/api/preboarding/${createdHire.token}`);
    expect(res.status).toBe(200);
    expect(res.body.firstName).toBe('Jean');
    expect(res.body.tenant).toBeDefined();
  });

  it('PATCH /preboarding/:token — auto-save du brouillon', async () => {
    if (!createdHire) return;
    const res = await request(app.getHttpServer())
      .patch(`/api/preboarding/${createdHire.token}`)
      .send({ civility: 'M.', birthPlace: 'Paris' });
    expect(res.status).toBe(200);
  });
});
