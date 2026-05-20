/* Seed initial — Sprint 0 — Organisation + Tenants + 1 admin */
import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import { CONVENTIONS } from '@sirh/conventions-data';
import { COMPANIES } from './seed-data/companies';

const prisma = new PrismaClient();

async function main() {
  // 1. Conventions collectives référentiel
  console.log('Seeding conventions collectives…');
  for (const c of CONVENTIONS) {
    await prisma.convention.upsert({
      where: { code: c.code },
      create: c,
      update: c,
    });
  }

  // 2. Organisation Paris Nord Groupe
  const org = await prisma.organisation.upsert({
    where: { slug: 'paris-nord-groupe' },
    create: { name: 'Paris Nord Groupe', slug: 'paris-nord-groupe' },
    update: {},
  });

  // 3. Tenants (56 entités du groupe)
  console.log(`Seeding ${COMPANIES.length} tenants…`);
  for (const c of COMPANIES) {
    await prisma.tenant.upsert({
      where: { code: c.code + '-' + (c.siret || c.name).slice(-4) },
      create: {
        organisationId: org.id,
        code: c.code + '-' + (c.siret || c.name).slice(-4),
        name: c.name,
        type: c.type || 'SIEGE',
        siren: c.siren,
        siret: c.siret,
        address: c.address,
        repName: c.rep,
        conventionCode: 'IDCC_3249', // par défaut formation pro
      },
      update: {},
    });
  }

  // 4. Compte admin par défaut, rattaché au premier tenant (000-DEFIS)
  const firstTenant = await prisma.tenant.findFirst({ orderBy: { code: 'asc' } });
  if (firstTenant) {
    const pepper = process.env.ARGON2_PEPPER || '';
    const passwordHash = await argon2.hash('Admin2026!' + pepper, { type: argon2.argon2id });
    await prisma.user.upsert({
      where: { email: 'admin@pn-groupe.fr' },
      create: {
        tenantId: firstTenant.id,
        email: 'admin@pn-groupe.fr',
        passwordHash,
        role: 'admin',
      },
      update: {},
    });
    console.log('Admin créé : admin@pn-groupe.fr / Admin2026!');
  }

  console.log('✅ Seed terminé');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
