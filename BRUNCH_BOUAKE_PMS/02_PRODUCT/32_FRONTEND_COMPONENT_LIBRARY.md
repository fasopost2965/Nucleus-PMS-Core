# 32_FRONTEND_COMPONENT_LIBRARY.md

**Projet :** Nucleus PMS Core
**Instance de référence :** Brunch Bouaké PMS
**Version :** 1.0
**Document :** Bibliothèque des Composants Frontend Réutilisables

---

# 1. Objectif de la Bibliothèque

Assurer une cohérence visuelle parfaite de type "Premium Space Station" (Evreghen Command Center) sur l'ensemble de l'application, réduire le temps de développement et garantir d'excellentes performances d'affichage. 

Chaque écran de la plateforme doit être assemblé exclusivement à l'aide de ces composants. Aucun style spécifique ou CSS personnalisé "hors charte" n'est autorisé.

---

# 2. Organisation du Code source React

Les composants sont classés par catégorie dans le dossier `src/components/` :

```text
src/components/
 ├── ui/                # Composants atomiques de base (Button, Badge, Tooltip)
 ├── forms/             # Contrôles de formulaires typés (Input, Select, DatePicker)
 ├── layout/            # Squelette structurel (Sidebar, Header, AppLayout)
 ├── datatable/         # Tableaux de données, filtres et pagination (DataTable)
 ├── business/          # Composants couplés métier (RoomCard, ReservationDrawer)
 └── charts/            # Composants de visualisation analytique (KPIWidget, OccupancyChart)
```

---

# 3. Composants Communs & Spécifications

## 3.1. Composants UI de base (Atomiques)

### `Button`
Bouton interactif avec micro-animations de hover et de clic (`motion` intégré).
* **Variantes** :
  * `primary` : Couleur d'accent "Orange Cacao" (`bg-amber-600 hover:bg-amber-700`).
  * `secondary` : Fond transparent dépoli avec bordure fine (`border border-slate-300 hover:bg-slate-100`).
  * `success` : Utilisé pour les validations et règlements (`bg-emerald-600 hover:bg-emerald-700`).
  * `danger` : Utilisé pour les annulations et alertes critiques (`bg-rose-600 hover:bg-rose-700`).

### `Badge`
Indicateur de statut ou de catégorie.
* **Variantes** :
  * `success` (Vert) : Chambres disponibles, Réservations terminées, Factures payées.
  * `warning` (Orange) : Réservations en attente d'acompte, Chambre à inspecter.
  * `danger` (Rouge) : Factures impayées, Incident technique critique.
  * `info` (Bleu) : Séjours en cours.
  * `neutral` (Gris) : Brouillon, Archivé.

---

## 3.2. Formulaires & Validation (`src/components/forms/`)

Tous les composants de formulaire s'intègrent nativement avec **React Hook Form** et **Zod** :
* **`TextInput` & `PasswordInput`** : Prise en charge des labels flottants, des messages d'erreur de validation et de l'indicateur de champ obligatoire (*).
* **`CurrencyInput`** : Input optimisé pour la saisie de montants financiers avec affichage automatique du symbole devise (ex. : `FCFA`).
* **`DatePicker` & `DateRangePicker`** : Calendrier interactif empêchant la saisie de dates passées pour les nouvelles réservations.

---

## 3.3. Tableau de Données (`src/components/datatable/DataTable.tsx`)

Composant unifié pour l'affichage des listes d'éléments (Clients, Réservations, Stocks).
* **Fonctionnalités intégrées** :
  * Barre de recherche globale.
  * Filtre multi-critères par statut ou catégorie.
  * Tri dynamique en cliquant sur les en-têtes de colonnes.
  * Pagination intelligente (ex. : 10, 25, 50 résultats par page).
  * Bouton "Exporter" (génère un fichier CSV ou ouvre la mise en page d'impression optimisée).

---

## 3.4. Widgets du Dashboard (`src/components/charts/`)

### `KPIWidget`
Composant d'affichage des statistiques clés.
* **Structure visuelle** :
  * Titre discret (ex : "Chiffre d'Affaires").
  * Valeur principale en grande typographie (ex : "450 000 FCFA").
  * Taux de progression en pourcentage avec icône de tendance verte/rouge.
  * Icône thématique décorative à droite.

### `RoomCard`
Composant représentant une chambre sur le dashboard de réception.
* **Structure visuelle** :
  * Numéro de chambre et catégorie bien visibles.
  * Indicateur visuel coloré du statut opérationnel actuel.
  * Actions rapides au survol (Check-in, Check-out, Ouvrir Folio, Signaler Panne).

---

# 4. Standards Visuels & Responsive (Tailwind CSS)

* **Palette de couleurs principale** :
  * Canvas principal de l'application : `bg-slate-50` (Clair, reposant).
  * Navigation latérale (Sidebar) : `bg-slate-900` (Sombre, premium).
  * Couleur d'accent principal (Cacao) : `text-amber-600` / `bg-amber-600`.
* **Coins arrondis** : Utilisation systématique de la classe `rounded-xl` (12px) pour les cartes et les conteneurs principaux, et `rounded-lg` (8px) pour les boutons et inputs.
* **Effet dépoli (Glassmorphism)** : `bg-white/80 backdrop-blur-md border border-white/20` pour les fenêtres modales et les tiroirs coulissants (Drawers).

---

**Fin du document – 32_FRONTEND_COMPONENT_LIBRARY.md**
