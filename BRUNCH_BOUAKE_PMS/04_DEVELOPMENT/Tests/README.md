# Tests - Nucleus PMS Core

Ce répertoire documente la stratégie de test de la plateforme. Les tests eux-mêmes vivent à côté du code qu'ils couvrent (convention `*.test.ts`), pas dans ce dossier.

## 1. Outils en place (depuis le 18/07/2026)

* **Backend** : Vitest + Supertest (`server/**/*.test.ts`). Voir `vitest.config.ts` à la racine.
  * Tests unitaires : logique pure (RBAC, résolution de rôle, tarification des réservations, rate limiting).
  * Tests d'intégration : montent le routeur Express réel (`server/routes/api.ts`) via Supertest, sans jamais écrire dans `server/data/pms_database.json` — les cas testés sont soit rejetés avant tout accès DB (401/403/400), soit des lectures pures.
* **Frontend** : pas encore de tests (Vitest + React Testing Library restent la stack recommandée, à mettre en place — voir `package.json`).

## 2. Lancer les tests

```bash
npm test
```

## 3. Structure recommandée pour la suite

* `/e2e` : Tests de bout en bout des parcours utilisateurs clés (Réservation, Check-in, Check-out) — non couverts à ce jour, à envisager une fois les modules Réception/Housekeeping/Finance branchés sur l'API réelle (ils fonctionnent encore en `localStorage`/mock, voir Changelog [1.2.0]).

---
*Dossier initialisé dans le cadre du figeage d'architecture de l'instance Brunch Bouaké PMS.*
