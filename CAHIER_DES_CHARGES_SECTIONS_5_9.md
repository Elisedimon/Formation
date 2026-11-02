# Cahier des Charges AST-Academy — Sections 5 à 9

**Version** : 1.0 | **Date** : 31 octobre 2026 | **Statut** : Complément contractuel (sections 5-9)

---

## 5. Exigences Non-Fonctionnelles

| Catégorie | ID | Exigence | Mesure |
|---|---|---|---|
| Performance | PERF-01 | Score Lighthouse ≥ 85 sur mobile (catalogue + détail cours) | Audit Lighthouse CI |
| Performance | PERF-02 | TTFB < 500 ms sur les endpoints API critiques | Monitoring serveur |
| Performance | PERF-03 | Génération du certificat < 5 s après déclenchement | Chronométrage E2E |
| Disponibilité | DISP-01 | Disponibilité mensuelle ≥ 99,5 % | Uptime monitoring |
| Disponibilité | DISP-02 | Maintenance planifiée hors heures ouvrées ouest-africaines | Calendrier maintenance |
| Scalabilité | SCAL-01 | Support de 10 000 utilisateurs simultanés (cible an 1) | Tests de charge |
| Sécurité | SEC-01 | Toutes les communications en HTTPS/TLS 1.2+ | Configuration serveur |
| Sécurité | SEC-02 | Conformité OWASP Top 10 | Audit de sécurité annuel |
| Sécurité | SEC-03 | Aucun secret exposé côté client (runtimeConfig public vs privé) | Audit de code |
| Accessibilité | ACC-01 | WCAG 2.1 niveau AA | Audit accessibilité |
| Internationalisation | INT-01 | Français par défaut ; devise XOF ; fuseau Africa/Porto-Novo | Tests i18n |
| Sauvegarde | SAUVE-01 | Backup PostgreSQL quotidien, rétention 30 jours, PITR | Tests de restauration |
| Observabilité | OBS-01 | Logs structurés + monitoring uptime + alerting sur webhooks échoués | Dashboards |
| RGPD | RGPD-01 | Droit à l'effacement et export des données utilisateur | Procédure documentée |
| RGPD | RGPD-02 | Consentement explicite pour la collecte de données | Case à cocher inscription |

---

## 6. Livrables Attendus

| # | Livrable | Description |
|---|---|---|
| 6.1 | Code source | Dépôt Git avec historique complet, branches de feature, tags de release |
| 6.2 | Documentation technique | README d'installation, schéma API (OpenAPI/Swagger), documentation des composables |
| 6.3 | Migrations Prisma | Fichiers de migration versionnés (`prisma/migrations/`) |
| 6.4 | Jeu de tests | Tests unitaires, d'intégration et E2E (Playwright) couvrant chaque exigence numérotée |
| 6.5 | Manuel utilisateur | Guides apprenant, formateur et administrateur |
| 6.6 | Environnements | Staging et production déployés et accessibles |
| 6.7 | Rapport de recette | Rapport signé validant chaque critère d'acceptation |

---

## 7. Planning et Jalons

| Jalon | Contenu | Durée | Livrable clé |
|---|---|---|---|
| J1 — Socle | Authentification (AUTH), Prisma, catalogue (CAT) | 3 semaines | Login/inscription fonctionnels, catalogue affiché |
| J2 — Paiement | FedaPay, webhooks, inscriptions (PAY) | 3 semaines | Paiement端到端, enrollment ACTIVE après webhook |
| J3 — Progression & Certification | Leçons, quiz, certificat (PRG, CRT) | 3 semaines | Quiz scoré, certificat généré et téléchargeable |
| J4 — Back-office | Administration et formateur (ADM, FRM) | 2 semaines | Gestion utilisateurs, cours, stats |
| J5 — Recette | Tests E2E, sécurité, performance (SEC, PERF) | 2 semaines | Rapport de recette signé, déploiement production |

---

## 8. Contraintes et Hypothèses

| ID | Contrainte / Hypothèse | Détail |
|---|---|---|
| C-01 | Compte marchand FedaPay | Clés API sandbox/live fournies avant J2 |
| C-02 | Stockage fichiers | Bucket S3 / Cloudflare R2 provisionné avant J3 |
| C-03 | Serveur SMTP | Opérationnel, délivrabilité > 95 % |
| C-04 | Nuxt 4 | Version stable, pas de breaking change en cours de projet |
| C-05 | Base de données | PostgreSQL provisionné, `DATABASE_URL` configurée |
| C-06 | Équipe | 1 dev full-stack + 1 designer + 1 PO |
| C-07 | Contexte géographique | Bénin / Afrique de l'Ouest, devise XOF, fuseau Africa/Porto-Novo |

---

## 9. Critères d'Acceptation

Chaque exigence numérotée (AUTH-XX, CAT-XX, PAY-XX, PRG-XX, CRT-XX, ADM-XX, FRM-XX, SEC-XX) doit être couverte par **au moins un test automatisé** (unitaire, d'intégration ou E2E).

Critères transverses bloquants pour la recette :

| # | Critère | Méthode de vérification |
|---|---|---|
| ACC-01 | 100 % des exigences AUTH, PAY, CRT, SEC ont un test E2E | Rapport de couverture Playwright |
| ACC-02 | Aucune vulnérabilité critique | `npm audit` + scan Snyk propre |
| ACC-03 | Score Lighthouse ≥ 85 mobile (catalogue + détail cours) | Audit Lighthouse CI |
| ACC-04 | Webhook avec signature invalide → HTTP 401 | Test d'intégration `/api/payments/webhook` |
| ACC-05 | Idempotence webhook : double envoi → un seul APPROVED | Test E2E envoi deux fois le même webhook |
| ACC-06 | Certificat vérifiable via endpoint public | Test `/api/certificates/verify/[number]` |
| ACC-07 | Rate limiting login : 10 tentatives/min/IP | Test de charge sur `/api/auth/login` |
| ACC-08 | Mot de passe hashé bcrypt (coût 12) | Inspection du hash en base |
| ACC-09 | Cookie `httpOnly`, `secure`, `sameSite=strict` | Inspection des headers `Set-Cookie` |
| ACC-10 | Aucun secret côté client | Audit `runtimeConfig.public` |

---

## 10. Corrections appliquées au schéma Prisma (alignement CDC)

Les ajouts suivants ont été apportés à `prisma/schema.prisma` pour résoudre les incohérences relevées dans l'analyse :

- `EnrollmentStatus` : ajout des valeurs `EXPIRED` et `SUSPENDED` (le diagramme d'états §4.4 y faisait référence).
- `PaymentStatus` : ajout de la valeur `REFUNDED` (déjà présente dans l'enum CDC mais absente du schéma).

**Non modifiés (par choix de compatibilité) :**
- Les valeurs d'enum restent en anglais (`STUDENT`, `INSTRUCTOR`, `ADMIN`, `ACTIVE`, `COMPLETED`, `CANCELLED`, `PENDING`, `APPROVED`, `DECLINED`) pour ne pas casser `useAuth.ts`, `requireRole` et les requêtes existantes. Le mapping vers les libellés français se fait en présentation uniquement.
- `QuizQuestion.correctAnswer` (index dans `options`) conservé : c'est une conception valide, pas une duplication avec `Answer.isCorrect` (le schéma actuel n'a pas de modèle `Answer` séparé).

**Points restant à trancher avant développement :**
- Formule du « score global ≥ 70 % » (CRT-01) : moyenne simple des quiz ou moyenne pondérée par `Question.points` ?
- Stratégie de réconciliation des paiements `PENDING` > 30 min (webhook manquant) : cron de polling ?
- Comportement d'un `Enrollment` `CANCELLED` : réutilisation ou suppression (contrainte `@@unique([userId, courseId])`) ?
