# Journal des Modifications (Changelog) - Nucleus PMS Core

Tous les changements majeurs apportés à l'architecture de la plateforme, au schéma de la base de données ou aux modules applicatifs sont répertoriés dans ce document.

---

## [1.1.0] - 2026-07-13
### Ajouté
* **Modularisation Complète du module Chambres (`Rooms.tsx`)** :
  * Migration d'un composant monolithique vers une structure de composants réutilisables et extensibles : `RoomFilters.tsx`, `RoomCard.tsx`, `RoomTable.tsx`, `RoomForm.tsx` et `RoomDetailsDrawer.tsx`.
  * Implémentation du modèle de calcul en temps réel des statuts de chambres (`roomUtils.ts`) fondé sur les corrélations d'occupation courante (réservations en séjour actif), entretien (housekeeping) et pannes (maintenance tickets).
  * Prise en charge native du modèle **multi-tarifs** de l'Hôtel Brunch (Standard, Week-end, Haute Saison, Corporate, OTA) avec calculs automatiques des coefficients de pré-remplissage.
* **Résolution de la Dette Technique et Rétrocompatibilité** :
  * Intégration de champs optionnels de rétrocompatibilité dans `IRoom` (`current_status`, `housekeeping_status`, `maintenance_status`) pour garantir la robustesse des autres écrans de l'application (Reception, Reservations, etc.).
  * Ajout d'une gestion défensive de la valeur nulle/indéfinie dans `RoomStatusBadge.tsx` pour parer à toute anomalie d'état au runtime (évitant le plantage de type `TypeError: can't access property "toLowerCase", status is undefined`).

## [1.0.0] - 2026-07-13
### Ajouté
* Figeage officiel de l'architecture professionnelle multi-tenant **Nucleus PMS Core**.
* Création de la structure documentaire unifiée sous `/BRUNCH_BOUAKE_PMS/` :
  * **00_VISION/** : Vision stratégique et spécifications fonctionnelles consolidées.
  * **01_ARCHITECTURE/** : Modèle d'architecture physique, schéma MySQL relationnel, architecture backend API REST et spécification détaillée des routes.
  * **02_PRODUCT/** : Cartographie complète de la navigation frontend React Router v7, matrice RBAC détaillée, bibliothèque de composants réutilisables.
  * **03_AI_PROMPTS/** : Prompts de référence pour Google AI Studio (Frontend) et Antigravity (Backend).
  * **04_DEVELOPMENT/** : Répertoires de Tests, Notes et Changelog.
