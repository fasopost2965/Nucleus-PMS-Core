# 27_NAVIGATION_MAP.md

**Projet :** Nucleus PMS Core
**Instance de référence :** Brunch Bouaké PMS
**Version :** 1.0
**Document :** Cartographie de la Navigation et Routage Frontend

---

# 1. Architecture de Routage (React Router v7)

La navigation de la Single Page Application (SPA) s'articule autour d'un routeur centralisé intégrant deux catégories de routes :
1. **Routes Publiques** : Accessibles sans authentification. Redirigent vers le Dashboard si l'utilisateur possède déjà une session active.
2. **Routes Protégées (Private Routes)** : Soumises à la validation du token JWT et au filtrage des permissions RBAC. Redirigent vers `/login` si l'utilisateur n'est pas connecté.

---

# 2. Plan Détaillé des Routes

```text
/                         ──► Redirection automatique vers /dashboard
/login                    ──► Écran d'authentification

/dashboard                ──► Tableau de bord opérationnel principal
  ├── /executive          ──► Vue consolidée pour Directeur et Administrateurs
  ├── /reception          ──► Activité d'accueil (Arrivées, Départs du jour)
  └── /operations         ──► État Housekeeping et Maintenance d'urgence

/reception                ──► Module Réception
  ├── /planning           ──► Calendrier interactif (Gantt) de réservation
  ├── /check-in           ──► Formulaire d'enregistrement d'arrivée
  ├── /check-out          ──► Processus de clôture de séjour et facturation
  └── /walk-in            ──► Création directe d'un séjour physique

/rooms                    ──► Gestion des chambres
  ├── /list               ──► Grille des états de chambres
  ├── /categories         ──► Configuration des types de chambres
  └── /pricing            ──► Écran de configuration des tarifs nuitée

/reservations             ──► Gestion des réservations
  ├── /create             ──► Création d'une réservation future
  ├── /calendar           ──► Calendrier global des arrivées
  └── /:id                ──► Fiche détaillée d'une réservation (Folio, historique)

/guests                   ──► Module Clients
  ├── /list               ──► Tableau de recherche des hôtes
  └── /:id                ──► Fiche d'identité client, préférences et séjours passés

/finance                  ──► Module Finance & Facturation
  ├── /invoices           ──► Liste des factures de séjours émis
  ├── /payments           ──► Journal des transactions comptables
  └── /cash-register      ──► État journalier de la caisse physique de l'hôtel

/restaurant               ──► Module Restaurant
  ├── /orders             ──► Prise de commande en salle et suivi des tables
  ├── /menu               ──► Gestion de la carte et des boissons
  └── /categories         ──► Configuration des sous-menus (ex. : Brunch, Cocktails)

/inventory                ──► Module Gestion des Stocks
  ├── /items              ──► Liste des produits en stock et seuils d'alerte
  ├── /movements          ──► Journal des entrées et sorties de stock
  └── /counts             ──► Interface de saisie d'inventaire de fin de mois

/reports                  ──► Statistiques & Reporting
  ├── /occupancy          ──► Rapport de fréquentation de l'hôtel (RevPAR)
  ├── /revenue            ──► Analyse mensuelle du CA (Chambres vs Resto)
  └── /exports            ──► Extraction Excel / CSV des journaux de vente

/settings                 ──► Paramètres Système (RBAC restreint)
  ├── /hotel              ──► Saisie des informations légales et coordonnées
  ├── /users              ──► Création et gestion des comptes utilisateurs
  └── /taxes              ──► Saisie des taux de TVA et taxes de séjour

/admin                    ──► Administration de la plateforme
  └── /audit-logs         ──► Visualisation du journal de sécurité applicatif
```

---

# 3. Modules avec Badge "À venir" (Hors MVP)

Ces liens figurent dans le menu de navigation latérale pour préserver la cohérence visuelle future de la plateforme SaaS, mais redirigent vers une vue informative "Module en préparation" :
* **`/pos`** : Point de vente restaurant tactile complet (Version 2).
* **`/crm`** : Outils de marketing direct et d'envoi de newsletters (Version 4).
* **`/channel-manager`** : Synchronisation automatique des OTA (Version 3).
* **`/loyalty`** : Module de gestion des programmes de fidélisation.

---

# 4. Protection et Gestion des Redirections

```text
[Interaction Utilisateur]
           │
           ▼
[Vérification Session]
   ├── Pas de session active ──► Redirection vers /login
   └── Session active
         │
         ▼
[Vérification Droits (RBAC)]
   ├── Permission refusée    ──► Redirection vers /403 (Accès interdit)
   └── Permission accordée   ──► Rendu du composant d'Écran Métier
```

---

# 5. Écrans Système standardisés

* **`404 Not Found`** : S'affiche lorsqu'aucune route ne correspond à l'URL demandée.
* **`403 Forbidden`** : S'affiche en cas d'accès non autorisé à un module.
* **`Offline State`** : Alerte bandeau supérieure persistante s'affichant en cas de perte de connexion réseau.

---

**Fin du document – 27_NAVIGATION_MAP.md**
