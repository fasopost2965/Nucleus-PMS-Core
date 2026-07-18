# Journal des Modifications (Changelog) - Nucleus PMS Core

Tous les changements majeurs apportés à l'architecture de la plateforme, au schéma de la base de données ou aux modules applicatifs sont répertoriés dans ce document.

---

## [1.2.0] - 2026-07-18
### Sécurité
* **Durcissement du RBAC backend** : la plupart des routes d'écriture (chambres, catégories de chambres, clients, réservations, RH, paramètres hôtel, paiements) ne vérifiaient qu'un JWT valide, sans jamais vérifier le rôle de l'utilisateur — n'importe quel compte authentifié pouvait donc, via l'API, supprimer une chambre, éditer un contrat RH ou changer les paramètres fiscaux. Ajout de `requireRole(...)` sur les 18 routes concernées, alignées sur `02_PRODUCT/28_PERMISSIONS_MATRIX.md`.
* **Rôle par défaut fail-closed** : un utilisateur sans rôle assigné se voyait auparavant attribuer `Super Administrateur` par défaut sur 7 endpoints (`user.role || 'Super Administrateur'`). Extraction dans `server/config/roles.ts` (`resolveRole()`) : un rôle manquant retombe désormais sur `Sans Rôle`, qui ne correspond à aucun groupe de permissions.
* **Suppression du vecteur d'escalade de privilèges côté client** : `src/utils/permissions.ts` lisait des surcharges de permissions depuis `localStorage` (`pms_privileges_<email>`), modifiable arbitrairement depuis la console du navigateur. Code mort (aucun appelant légitime), supprimé.
* **Intégrité des réservations** : `POST /reservations` acceptait le prix, le statut et même l'ID directement depuis le payload client (`{ ...défauts, ...req.body }`). Le tarif est désormais toujours dérivé du catalogue chambre (`room.base_price`) et de la durée du séjour, jamais du payload (`server/services/reservationPricing.ts`). Ajout d'un contrôle de chevauchement (une chambre déjà réservée sur la période est refusée avec 409) et d'une vérification d'existence du `guest_id`.
* **Anti-énumération de comptes** : `POST /auth/forgot-password` renvoyait un 404 distinct pour un email inconnu, permettant de vérifier l'existence d'un compte. Réponse désormais générique (200) dans tous les cas.
* **Rate limiting étendu** : `/auth/forgot-password` et `/auth/reset-password` n'avaient aucune limitation de débit (le code de réinitialisation à 6 chiffres était donc brute-forçable). Ajout de limiteurs dédiés (`server/middlewares/rateLimiters.ts`), mêmes paramètres que le limiteur de login existant (10 requêtes / 15 min / IP).

### Infrastructure de test
* **Mise en place de Vitest + Supertest** : le projet n'avait jusqu'ici aucun framework de test automatisé (`04_DEVELOPMENT/Tests/` était un dossier vide). 58 tests ajoutés (unitaires + intégration sur le routeur réel), `npm test` disponible.

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
