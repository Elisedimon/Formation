# Plan — Paramètres administrateur (maintenance, infos plateforme, feature flags)

## Objectif
Rendre la page `/admin/parametres` fonctionnelle et centraliser la configuration de la plateforme : maintenance planifiée, informations plateforme, et feature flags. La maintenance bloque l’accès aux non-admins.

## Décisions
- Stockage : table `PlatformSetting` (clé/valeur typée) pour flexibilité.
- Accès maintenance : administrateurs uniquement.
- Maintenance planifiée : début/fin programmables, message personnalisable.
- Réglages : maintenance + infos plateforme + feature flags.

## Modèle Prisma
Ajouter `model PlatformSetting` :
- `key String @id`
- `value String`
- `type String` (string/boolean/number/date)
- `updatedAt DateTime @updatedAt`
- `updatedBy String?` (admin id)

## API
- `GET /api/admin/settings` : retourne tous les réglages (admin only).
- `PUT /api/admin/settings` : met à jour un ou plusieurs réglages (admin only, validation par clé).
- Clés initiales : `maintenance.enabled`, `maintenance.message`, `maintenance.startAt`, `maintenance.endAt`, `platform.name`, `platform.supportEmail`, `platform.appUrl`, `features.enrollments`, `features.payments`, `features.quizzes`.

## Enforcement
- Middleware serveur Nitro : si `maintenance.enabled` et hors période admin, retourner 503 avec message pour les routes non-admin.
- Côté client : page de maintenance affichée pour non-admins.

## UI (`/admin/parametres`)
- Section Maintenance : toggle, message, date début/fin.
- Section Plateforme : nom, email support, URL.
- Section Fonctionnalités : toggles inscriptions, paiements, quiz.
- Bouton Enregistrer avec notification.

## Migration / seed
- `prisma db push` + seed des clés par défaut.
- Aucune migration destructive.

## Risques
- Verrouillage accidentel : toujours autoriser les admins.
- Mauvais format de date : validation côté serveur.
- Feature flags non appliqués partout : vérifier les guards dans les endpoints concernés.

## Validation
- Build Nuxt.
- Test accès non-admin pendant maintenance (503/page).
- Test CRUD réglages.
- Test annulation de maintenance.