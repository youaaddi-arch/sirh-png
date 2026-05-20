# Sécurité — SIRH Paris Nord

## Authentification

- **Argon2id** pour le hachage des mots de passe (mémoire 19 Mo, 2 itérations)
- **Pepper applicatif** (`ARGON2_PEPPER`) en plus du salt
- **JWT** 15 min + refresh token 7j (rotatif)
- **2FA TOTP** (RFC 6238) **obligatoire** pour les rôles `admin`, `rh`, `paie`
- **Verrouillage automatique** après 5 tentatives échouées (15 min)
- **Sessions** stockées localStorage côté front (à migrer vers HttpOnly cookie en prod)

## Chiffrement

- **TLS 1.3** partout (Caddy + Let's Encrypt)
- **HSTS** activé (max-age 1 an)
- **Données sensibles chiffrées at-rest** (production) :
  - Numéro de Sécurité Sociale
  - IBAN / BIC
  - Salaire brut
  - Pièces d'identité (stockage MinIO chiffré)
- **PostgreSQL** : chiffrement de la base au niveau du système de fichiers (LUKS)

## Headers HTTP

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self' ...
```

## Permissions par rôle

| Rôle | Voit | Peut modifier |
|---|---|---|
| `admin` | Tout, tous tenants | Tout |
| `rh` | Tout son tenant | Tout son tenant |
| `paie` | Son tenant (lecture seule sauf paie) | Paie |
| `manager` | Son équipe directe + transitive | Validations sur son équipe |
| `employe` | Lui-même uniquement | Son profil, ses demandes |

Toutes les requêtes passent par un **middleware tenant scoping** qui filtre
automatiquement par `tenant_id`.

## Audit trail

Toutes les opérations mutatives (POST/PATCH/DELETE) sont automatiquement
loguées via `AuditInterceptor` avec :
- Utilisateur, action, entité, ID
- IP, User-Agent
- Horodatage

Consultable depuis l'interface `/rgpd` → onglet **Audit**.

## Rate limiting

- **100 requêtes / 60 sec / IP** par défaut (Throttler NestJS)
- Endpoints sensibles (auth, preboarding) : limite plus stricte

## Dépendances

- `pnpm audit` exécuté en CI
- **Renovate** ou **Dependabot** pour MAJ automatique
- Pas de package > 6 mois sans mise à jour majeure

## Bonnes pratiques de développement

- Aucun `console.log` de données sensibles
- Pas de `eval()`, `dangerouslySetInnerHTML` sans escape
- DTOs validés (`class-validator`) sur tous les endpoints
- Tests E2E couvrant les workflows critiques

## Incident response

En cas de violation de données :
1. Bloquer immédiatement les comptes compromis
2. Notifier la CNIL **sous 72h** (art. 33 RGPD)
3. Informer les personnes concernées si risque élevé (art. 34)
4. Logger l'incident dans le registre des traitements
5. Restaurer depuis backup si nécessaire

Contact CNIL : https://www.cnil.fr/fr/notifier-une-violation-de-donnees-personnelles
