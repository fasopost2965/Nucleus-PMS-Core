# 01_PROJECT_OVERVIEW.md

**Projet :** Nucleus PMS Core
**Instance de référence :** Brunch Bouaké PMS
**Version :** 1.0
**Statut :** Document fondateur de la plateforme

---

# 1. Présentation de la plateforme

**Nucleus PMS Core** est un système de gestion hôtelière (Property Management System) professionnel, multi-tenant et hautement configurable, conçu pour gérer l'ensemble des opérations quotidiennes des établissements hôteliers modernes. 

**Brunch Bouaké PMS** constitue la première instance de production de cette plateforme SaaS, intégrant les spécificités de la gestion de chambres haut de gamme combinée à un service de restauration et de brunch réputé.

Le système est conçu dès son origine pour centraliser l'exploitation opérationnelle et simplifier les flux d'informations entre les différents services (Réception, Restaurant, Housekeeping, Comptabilité, Maintenance, Stock).

---

# 2. Vision stratégique

Construire la plateforme PMS de référence pour le marché ouest-africain, alliant la rigueur des standards internationaux de l'hôtellerie à une flexibilité maximale s'adaptant aux réalités locales (moyens de paiement mobile money, fiscalité spécifique, gestion robuste du hors-ligne/reconnexion).

L'architecture est pensée comme un noyau stable ("Core") entouré de modules spécialisés pouvant être activés à la demande :
1. **PMS Core** : Gestion hôtelière classique (Chambres, Clients, Réservations, Facturation, Housekeeping, Rapports).
2. **POS Integrated** : Module point de vente restaurant, bar et boutique (préparé pour le MVP, prêt à être déployé).
3. **Channel Manager & OTA Sync** : Synchronisation temps réel avec les plateformes de réservation en ligne (Booking.com, Expedia, Airbnb, etc.).
4. **CRM & Fidélité** : Moteur de fidélisation et de communication client.

---

# 3. Objectifs de la plateforme

Le Nucleus PMS Core doit garantir :
* **Fiabilité et intégrité des données** : Pas de perte d'historique, contrôles stricts de concurrence et traçabilité absolue (Audit Log).
* **Expérience utilisateur (UX) d'exception** : Interface fluide basée sur le concept d'Evreghen Command Center, éliminant les temps de saisie inutiles.
* **Architecture découplée** : Séparation stricte entre le Frontend (React/Vite) et le Backend (Node.js/Express/MySQL) pour permettre une extensibilité totale vers des applications mobiles tierces ou des intégrations matérielles (serrures magnétiques, imprimantes tickets).

---

# 4. Périmètre du MVP (Première Instance - Brunch Bouaké)

La première version déploie l'intégralité du socle commun :
* **Authentification & RBAC** : Gestion fine des rôles et permissions.
* **Tableau de bord principal** : Widgets temps réel pour l'occupation, les départs/arrivées, les alertes de stock et la maintenance.
* **Réception active** : Arrivées/départs, check-in, check-out, attribution des chambres et gestion des séjours.
* **Chambres & Tarification** : Gestion des catégories de chambres, statuts opérationnels et tarification dynamique.
* **Fiches Clients (CRM light)** : Historique de séjour, préférences de consommation et coordonnées de contact.
* **Facturation & Encaissements** : Folios de séjour, proformas, factures définitives et encaissements multi-modes (Espèces, Cartes, Mobile Money, Virements).
* **Housekeeping & Maintenance** : Suivi du nettoyage des chambres et gestion des tickets d'incidents techniques.
* **Restaurant & Stock intégré** : Prise de commandes sur place ou rattachées aux séjours, gestion des stocks avec alertes sur les produits critiques.

Le module **POS (Point of Sales)** complet est déjà préparé dans les interfaces avec des statuts "À venir" pour valider l'ergonomie globale auprès des utilisateurs finaux.

---

# 5. Roadmap d'évolution de la plateforme

```text
┌─────────────────────────────────────────────────────────┐
│                      NUCLEUS CORE                       │
│  (Chambres, Réservations, Factures, Clients, Rapports)  │
└────────────────────────────┬────────────────────────────┘
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
   [Étape v2 : POS RESTO]             [Étape v3 : OTA SYNC]
   - Plan de table interactif         - Connecteurs Booking.com
   - Suivi cuisine temps réel         - Moteur Channel Manager
   - Imprimantes tickets thermiques    - Tarification temps réel
            │                                 │
            └────────────────┬────────────────┘
                             ▼
                 [Étape v4 : CRM & MOBILE]
                 - Fidélité, SMS, WhatsApp
                 - Application check-in client
```

---

# 6. Critères de réussite de l'instance Brunch Bouaké

* **Zéro friction comptable** : Intégrité totale de la numérotation des factures, de la comptabilisation des taxes (TVA, taxe de séjour) et du suivi des modes de paiement.
* **Adoption immédiate** : Temps d'apprentissage réduit pour le personnel de réception et de salle grâce à un design épuré et ultra-rapide.
* **Indépendance vis-à-vis du code** : Toutes les données spécifiques à l'hôtel (coordonnées, taxes, devises, catégories) sont modifiables depuis les paramètres sans toucher à l'infrastructure applicative.

---

**Fin du document – 01_PROJECT_OVERVIEW.md**
