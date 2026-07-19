# Journal des Modifications (Changelog) - Nucleus PMS Core

Tous les changements majeurs apportés à l'architecture de la plateforme, au schéma de la base de données ou aux modules applicatifs sont répertoriés dans ce document.

---

## [1.3.1] - 2026-07-19
### Correctif critique — réinitialisation de mot de passe
* **Bug de fond identifié en production** : `reset_code` et `reset_code_expires` étaient écrits par le flux mot de passe oublié (`server/routes/api.ts`) mais n'avaient **jamais été ajoutés comme colonnes MySQL** (contrairement à `must_change_password`, `logo`, `extra_config`, chacun ayant sa propre migration `ALTER TABLE` dans `server/config/db.ts`). Conséquence concrète sur tout déploiement où MySQL est configuré (`DB_HOST` défini) : `saveCollection()` filtre chaque écriture contre `DESCRIBE users` avant de synchroniser vers MySQL — `reset_code`/`reset_code_expires` n'étant pas des colonnes réelles, ils étaient silencieusement supprimés de la synchronisation. La lecture suivante (`reset-password`) privilégiant MySQL quand il est en ligne, elle ne voyait jamais le code généré : **le code de réinitialisation était donc toujours rejeté comme invalide, quel que soit le code réellement saisi.** Ce n'était pas un problème de configuration SMTP ni de déploiement — un bug structurel, indépendant de l'email.
* **Corrigé** : ajout des deux migrations `ALTER TABLE` manquantes (même patron que les autres colonnes ajoutées après coup) + ajout des deux colonnes dans `schema.sql` pour les nouvelles installations.
* **Observabilité** : un échec d'envoi d'email de réinitialisation est désormais aussi consigné dans `audit_logs` (visible dans Admin > Journal d'activité), pas seulement dans les logs serveur — un administrateur peut diagnostiquer un souci de livraison sans accès SSH.
* **Rappel** : l'écran Admin > Utilisateurs > Modifier permet déjà à un Super Administrateur de définir directement le mot de passe de n'importe quel compte (`PUT /users/:id`), sans dépendre de l'email — c'est le moyen immédiat de débloquer un compte, indépendamment de ce correctif.

---

## [1.3.0] - 2026-07-18
### Intégrité des données
* **Transactions atomiques pour les flux réservation/chambre** : la création d'une réservation, le check-in et le check-out effectuaient deux écritures indépendantes (réservation puis chambre), avec un risque réel de désynchronisation en cas d'échec entre les deux (ex. chambre restée "Occupée" alors que la réservation est déjà "Terminée"). Ajout de `db.runTransaction()` (`server/config/db.ts`) : écriture atomique unique pour le stockage JSON local, et transaction SQL réelle (`BEGIN`/`COMMIT`/`ROLLBACK`) lorsque MySQL est le backend actif.
* **Nouvel endpoint `POST /reservations/:id/check-out`** : le départ n'existait jusqu'ici que côté client (simulation `localStorage` dans `Reception.tsx`), sans aucune trace serveur.
* **Séparation `PUT /rooms/:id` vs `PUT /rooms/:id/status`** : la Réception a besoin de faire évoluer le statut opérationnel d'une chambre (occupée/à nettoyer/incident) sans jamais pouvoir modifier son tarif de base — désormais deux routes distinctes avec des permissions différentes, conformément à `28_PERMISSIONS_MATRIX.md`.

### Modules branchés sur l'API réelle
* **`Reception.tsx`** ne fonctionnait qu'en `localStorage`/données simulées (aucun appel API), en contradiction directe avec l'objectif d'intégrité des données de la plateforme. Le module charge désormais les chambres, réservations et clients depuis l'API, et le check-in/check-out/changement de statut de chambre persistent réellement en base.
* **`Finance.tsx`** (onglets Factures et Règlements) : `POST /finance/payments` existait déjà mais ne mettait jamais à jour la facture associée (le solde restant pouvait diverger arbitrairement des paiements réels). Nouvel endpoint `POST /finance/invoices/:id/pay` (atomique via `db.runTransaction`, montant plafonné serveur au solde réel) et `GET /finance/payments` (n'existait pas). Les onglets Dépenses et Caisse restent en simulation locale — aucune table `expenses` ni concept de caisse/shift n'existe dans le schéma.
* **`Housekeeping.tsx`** : aucune route backend n'existait pour les tâches de ménage (la table `housekeeping_tasks` existait dans le schéma mais rien ne la lisait/écrivait). Ajout de `GET /housekeeping-tasks` et `PUT /housekeeping-tasks/:id` (mise à jour atomique tâche + statut ménage de la chambre). Nouveau groupe `HOUSEKEEPING_ROLES` dans `server/config/roles.ts`. Le mouvement de linge/stock déclenché à la validation reste une simulation locale (le module Stock n'a lui-même aucune route backend).
* **`Inventory.tsx` (Stock)** — décision utilisateur : seule la table `stock_items` existe dans le schéma (`suppliers` et `stock_movements` n'existent pas du tout, et la simulation de cycle de lavage n'a aucun équivalent réel en base). Branchement volontairement limité aux articles de stock (`GET`/`PUT /stock-items`, remplacement en masse comme `PUT /room_categories`). Nouveau groupe `STOCK_WRITE_ROLES` (Super Administrateur + Magasinier / Stock — le Directeur est en lecture seule sur ce module, contrairement aux autres). Fournisseurs, mouvements et simulation de lavage restent en `localStorage`.
* **`Restaurant.tsx`** : aucune route backend n'existait, alors que `restaurant_menu_items` et `restaurant_orders` existent dans le schéma (la page tournait même sans `localStorage` — un simple rafraîchissement effaçait tout). Ajout de `GET`/`POST /restaurant/menu-items`, `PUT /restaurant/menu-items/:id` et `GET`/`PUT /restaurant/orders/:id`. La liste des plats par commande sur les bons de cuisine (autrefois codée en dur par ID de commande simulée) a été remplacée par un message honnête : aucune table de lignes de commande n'existe pour fournir un vrai détail plat par plat.
* **Rapports financiers (`Reports.tsx`)** : l'onglet "Performances Financières" affichait 4 mois de chiffres entièrement inventés. Nouveau `GET /reports/financial-performance` qui calcule un vrai rapport mensuel (chiffre d'affaires, nuitées, taux d'occupation, taxes) à partir des réservations réelles, regroupées par mois d'arrivée (simplification assumée : pas de ventilation nuit par nuit pour un séjour à cheval sur deux mois). L'onglet Temps de service/Connexions reste en simulation locale — aucune table ne suit les pointages ou connexions.

### Traçabilité
* **Couverture du journal d'audit étendue** : `logActivity()` n'était appelé que sur ~12 routes admin sur une trentaine d'écritures. Ajouté sur les routes clients, réservations, check-in/check-out, paiements, l'ensemble des routes RH, catégories de chambres, paramètres hôtel, et les opérations système sensibles (`/system/purge`, `/system/sync`, `/system/seed`), ainsi que sur le changement/la réinitialisation de mot de passe.

### Accessibilité & performance
* Ajout d'attributs ARIA (`role="dialog"`, `aria-modal`, `aria-labelledby`) sur `Modal.tsx`/`ConfirmDialog.tsx`, `aria-current="page"` sur la navigation principale, et `aria-label` sur plusieurs boutons à icône seule dans `AppLayout.tsx`.
* **Auto-hébergement des polices** : `index.css` chargeait Inter et JetBrains Mono depuis `fonts.googleapis.com` à chaque chargement de page, ce qui contredisait l'objectif de résilience hors-ligne du projet. Les deux polices (variables, licence SIL Open Font) sont désormais servies localement depuis `public/fonts/`.

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

## [1.1.1] - 2026-07-14 → 2026-07-17 (entrée reconstituée)
Le journal n'avait pas été tenu à jour pendant cette période malgré ~29 commits ; entrée reconstituée après-coup depuis `git log` pour combler le vide, regroupée par thème plutôt que commit par commit.

### Backend
* Mise en place initiale du backend Express/MySQL : schéma, routes HRMS, support de repli (fallback) JSON local.
* Intégration Housekeeping côté backend et synchronisation des statuts de chambre.
* Authentification persistante et connexion via l'API (remplacement de la simulation locale).
* Mise en œuvre des contrôles de sécurité et d'accès (première itération), intégrée ensuite avec le suivi des feuilles de temps (audit logs, états de pause).
* Configuration d'environnement pour le déploiement Hostinger (`.env`).

### Fonctionnalités
* Récupération dynamique de la configuration hôtel (devise, taxes, coordonnées) depuis la base plutôt que codée en dur.
* Récupération de mot de passe et notifications toast côté connexion.
* Refactorisation du formulaire employé dans les Paramètres (découplage de la soumission).
* Parcours de changement de mot de passe forcé (première connexion).
* API de gestion des catégories de chambres.
* Fonctionnalité d'édition utilisateur pour les administrateurs.

### Sécurité (corrigé avant l'audit du 18/07, pour mémoire)
* Suppression du bypass universel de mot de passe à la connexion.
* Suppression du secret JWT codé en dur (fallback).
* Ajout d'un premier middleware RBAC sur les routes de maintenance système.
* Ajout de Helmet, CORS strict et rate limiting sur le login.
* Correction de vulnérabilités réintroduites par des commits concurrents.
* Correction d'une fuite du code de réinitialisation de mot de passe dans la réponse API.

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
