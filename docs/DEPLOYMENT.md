# Déploiement SIRH Paris Nord — Production

## Pré-requis serveur

- 1 serveur Linux (OVH Public Cloud D2-4 minimum) : 2 vCPU, 4 Go RAM, 50 Go disque
- Docker 24+ et Docker Compose v2
- Domaine pointant vers l'IP du serveur (ex. `sirh.pn-groupe.fr`)
- 1 base PostgreSQL (managée OVH Cloud DB recommandée) ou intégrée au compose

## 1. Préparation

```bash
# Sur le serveur
git clone https://github.com/youaaddi-arch/sirh-png.git
cd sirh-png
git checkout main   # ou la branche de release
```

## 2. Configuration

```bash
cp infrastructure/.env.prod.example infrastructure/.env.prod
nano infrastructure/.env.prod
```

Remplir :
- `PG_USER`, `PG_PASSWORD`, `PG_DB`
- `DATABASE_URL=postgresql://...`
- `JWT_SECRET` (32 caractères aléatoires minimum, `openssl rand -base64 32`)
- `ARGON2_PEPPER` (idem)
- `S3_*` ou config MinIO local
- `SMTP_*` (Brevo recommandé : 25 €/mois, hébergement français)
- `ANTHROPIC_API_KEY` (optionnel — sinon fallback template)
- `WEB_BASE_URL=https://sirh.pn-groupe.fr`

## 3. Caddy (TLS automatique)

Modifier `infrastructure/Caddyfile` avec votre domaine. Caddy gère
automatiquement les certificats Let's Encrypt.

## 4. Démarrage

```bash
cd infrastructure
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec api npx prisma migrate deploy
docker compose -f docker-compose.prod.yml exec api npx ts-node prisma/seed.ts
```

## 5. Vérifications

```bash
curl https://sirh.pn-groupe.fr/api/health
# → { status: "ok", database: "up" }
```

Connexion : `admin@pn-groupe.fr` / `Admin2026!` (à changer immédiatement).

## 6. Sauvegardes

PostgreSQL — sauvegarde quotidienne automatique :

```bash
# /etc/cron.daily/backup-sirh.sh
docker compose -f /opt/sirh-png/infrastructure/docker-compose.prod.yml \
  exec -T postgres pg_dump -U $PG_USER $PG_DB | \
  gzip > /backup/sirh-$(date +%F).sql.gz

# Conservation 30 jours
find /backup -name "sirh-*.sql.gz" -mtime +30 -delete
```

MinIO — synchronisation S3 chiffré (snapshot mensuel + backup off-site).

## 7. Monitoring

- **Sentry** (erreurs) : ajouter `SENTRY_DSN` dans `.env.prod`
- **UptimeRobot** : pinger `/api/health` toutes les 5 minutes
- **Logs centralisés** : `docker compose logs -f` ou Loki/Grafana

## 8. Mise à jour

```bash
cd /opt/sirh-png
git pull
cd infrastructure
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec api npx prisma migrate deploy
```

## 9. Restauration (cas de désastre)

```bash
# Postgres
gunzip < /backup/sirh-2026-XX-XX.sql.gz | \
  docker compose exec -T postgres psql -U $PG_USER $PG_DB

# MinIO : restauration depuis le snapshot off-site
```

## Coûts mensuels estimés

| Composant | Coût HT |
|---|---|
| OVH Public Cloud D2-4 | 25 € |
| OVH Cloud DB PostgreSQL 1vCPU 4Go | 35 € |
| OVH Object Storage 100 Go | 6 € |
| Brevo (emails 10k/mois) | 25 € |
| Claude API (~50 contrats/mois) | 5 € |
| Domaine + SSL (Let's Encrypt gratuit) | 2 € |
| Sentry + UptimeRobot Free | 0 € |
| **TOTAL Phase 1** | **~100 €/mois** |
| Yousign (Phase 2 — 100 sign/mois) | +60 € |
| Mindee OCR (100 pages/mois) | +50 € |
| **TOTAL Phase 2** | **~210 €/mois** |

## Sécurité

Voir [SECURITY.md](./SECURITY.md) et [RGPD.md](./RGPD.md).
