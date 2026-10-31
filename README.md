# AST-Academy

**All Solution Technologie** – Plateforme de formation tech moderne.

## Stack

- **Nuxt 4** + Vue 3
- **Tailwind CSS** + animations CSS avancées (cubic-bezier + keyframes)
- **Prisma** + PostgreSQL
- **FedaPay** (paiements Mobile Money / carte)
- **JWT HttpOnly cookie** + bcrypt (authentification)

## Design

- Palette : bleu nuit (`#10192C`), orange corail (`#E45530`) et blanc cassé (`#FAF8F5`)
- Typographie : Inter + Plus Jakarta Sans
- Composants arrondis, contraste éditorial et surfaces blanc cassé
- Animations de halo, flottement, dégradé ton sur ton et transition de page avec respect de `prefers-reduced-motion`

## Démarrage rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Copier les variables d'environnement
cp .env.example .env
# → Éditer .env : DATABASE_URL, JWT_SECRET, FEDAPAY_SECRET_KEY, FEDAPAY_PUBLIC_KEY
#   En production, configurer aussi NUXT_PUBLIC_APP_URL en HTTPS.

# 3. Base de données
npx prisma generate
npx prisma db push
npm run db:seed          # formations de démo

# 4. Lancer le serveur de développement
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

Hors production, le seed crée trois comptes de démonstration :

| Rôle | E-mail | Mot de passe |
| --- | --- | --- |
| Admin | `admin@ast-academy.test` | `AstAdmin2026!` |
| Apprenant | `demo@ast-academy.test` | `AstDemo2026!` |
| Formateur | `prof@ast-academy.test` | `AstProf2026!` |

Ces comptes sont créés ou actualisés avec `npm run db:seed` et ne sont jamais créés lorsque `NODE_ENV=production`.

---

## API Authentification

| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/api/auth/register` | Créer un compte |
| `POST` | `/api/auth/login` | Se connecter |
| `GET`  | `/api/auth/me` | Utilisateur courant |
| `POST` | `/api/auth/logout` | Déconnexion |
| `GET`  | `/api/enrollments/me` | Formations de l'utilisateur courant |

---

## API Paiements (FedaPay)

| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/api/payments/create` | Créer un paiement + lien FedaPay (auth requis) |
| `GET`  | `/api/payments/callback` | Retour utilisateur après paiement |
| `POST` | `/api/payments/webhook` | Webhook FedaPay (statut transaction) |

### Flux

1. L'élève authentifié clique **S'inscrire et payer** sur une formation.
2. `POST /api/payments/create` crée un `Payment` (PENDING) et une transaction FedaPay.
3. L'utilisateur est redirigé vers la page de paiement FedaPay (Mobile Money, carte…).
4. Après paiement :
   - **Callback** (`/api/payments/callback`) vérifie la transaction auprès de FedaPay avant de mettre à jour le statut et l'inscription.
   - **Webhook** vérifie également la transaction auprès de FedaPay avant d'accorder l'accès.
5. Redirection vers `/payments/success` ou `/payments/failed`.

### Configuration FedaPay (dashboard)

1. Récupérer les clés **sandbox** (ou live) → `.env`
2. Créer un webhook pointant vers :  
   `https://votre-domaine.com/api/payments/webhook`  
   Événements : `transaction.approved`, `transaction.declined`, `transaction.canceled`
3. `NUXT_PUBLIC_APP_URL` doit être l'URL publique de l'app (utilisée pour `callback_url`)

### Body – Create payment

```json
{ "courseId": "clxxxx..." }
```

Réponse :

```json
{
  "paymentId": "...",
  "amount": 149000,
  "currency": "XOF",
  "paymentUrl": "https://...",
  "course": { "id": "...", "title": "..." }
}
```

---

## API Formations

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/courses` | Liste des formations publiées |
| `GET` | `/api/courses/:id` | Détail (id ou slug) |

### Espaces par rôle

- **Apprenant** (`/mon-espace`) : formations actives et terminées après inscription confirmée.
- **Formateur** (`/formateur`) : création de brouillons et suivi des inscriptions à ses formations. La publication reste sous contrôle de l’administration.
- **Administrateur** (`/admin`) : indicateurs globaux, comptes récents, paiements, création de formations et publication/dépublication.

Les routes d’administration et de formateur contrôlent le rôle côté serveur. La migration `20261029123000_course_instructors` relie les formations à leur formateur ; appliquez les migrations avec `npx prisma migrate deploy` en production ou `npx prisma db push` en développement.

---

## Structure

```
ast-academy/
├── app/
│   ├── components/
│   ├── composables/     # useAuth
│   ├── pages/
│   │   ├── auth/        # login, register
│   │   ├── formations/  # index, [id]
│   │   └── payments/    # success, failed
│   └── ...
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── server/
│   ├── api/
│   │   ├── auth/
│   │   ├── courses/
│   │   ├── enrollments/  # espace élève
│   │   └── payments/    # create, callback, webhook
│   └── utils/           # prisma, auth, fedapay
└── ...
```

## Licence

Propriétaire – AST-Academy / All Solution Technologie
