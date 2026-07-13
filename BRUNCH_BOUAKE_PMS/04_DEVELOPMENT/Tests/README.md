# Tests - Nucleus PMS Core

Ce répertoire est destiné à stocker les spécifications, cas de test, scripts d'intégration et configurations de tests de la plateforme PMS.

## 1. Structure Recommandée

* `/unit` : Tests unitaires des services backend et des helpers frontend.
* `/integration` : Tests d'intégration des API (endpoints, base de données).
* `/e2e` : Tests de bout en bout des parcours utilisateurs clés (Réservation, Check-in, Check-out).

## 2. Outils de Test suggérés

* **Frontend** : Vitest, React Testing Library.
* **Backend** : Jest / Supertest.

---
*Dossier initialisé dans le cadre du figeage d'architecture de l'instance Brunch Bouaké PMS.*
