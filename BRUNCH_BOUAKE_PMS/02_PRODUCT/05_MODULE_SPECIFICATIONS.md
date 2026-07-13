# 05_MODULE_SPECIFICATIONS.md

**Projet :** Nucleus PMS Core
**Instance de référence :** Brunch Bouaké PMS
**Version :** 1.0
**Document :** Spécifications Fonctionnelles Détaillées des Modules MVP

---

# 1. Module Dashboard Principal
* **Objectif** : Fournir une vision consolidée et en temps réel des opérations de l'établissement.
* **Composants d'écran** :
  * **Barre d'activité rapide** : Boutons d'accès direct pour *Nouvelle Réservation*, *Enregistrer Client*, *Check-in*, *Check-out*, *Ajouter Commande Resto*.
  * **Grille de KPIs hôteliers** : Cartes animées affichant le taux d'occupation, le chiffre d'affaires cumulé, les arrivées attendues, les départs à traiter.
  * **Bento Grille Opérations** :
    * *Housekeeping* : Liste des chambres à nettoyer d'urgence.
    * *Maintenance* : Suivi des tickets de pannes critiques.
    * *Stocks* : Alerte sur les consommables de brunch proches du seuil critique.
  * **Fil d'activité récent** : Flux chronologique des dernières actions effectuées (connexions, encaissements, réservations créées).

---

# 2. Module Réception & Plan de Séjour
* **Objectif** : Gérer les interactions clients de l'arrivée au départ.
* **Composants d'écran** :
  * **Vue Planning Interactif (Gantt)** : Calendrier graphique affichant la liste des chambres en ordonnée et les jours du mois en abscisse. Les réservations s'affichent sous forme de blocs colorés déplaçables (Drag-and-Drop pour changement de chambre ou prolongation).
  * **Formulaire d'enregistrement express (Walk-in)** : Permet de louer instantanément une chambre libre à un client physique sans réservation préalable.

---

# 3. Module Chambres & Tarification
* **Objectif** : Configurer l'inventaire physique et administrer la tarification.
* **Composants d'écran** :
  * **Grille de gestion des chambres** : Filtre par étage, catégorie de chambre et statut. Code couleur dynamique (Vert = Libre, Rouge = Occupé, Orange = Réservé, Violet = Maintenance).
  * **Écran Catégories & Tarifs** : Permet de définir les catégories de chambres (Standard, Suite, Cacao VIP) et leurs tarifs nuitée de base associés.

---

# 4. Module Fiches Clients (CRM)
* **Objectif** : Centraliser les profils et l'historique des hôtes.
* **Composants d'écran** :
  * **Tableau de recherche de clients** : Recherche instantanée par nom, email, téléphone ou numéro d'identité.
  * **Vue Détails Client** : Fiche individuelle affichant les coordonnées, la nationalité, le document d'identité scanné ou saisi, les préférences particulières (ex. : "climatisation forte", "allergie fruits de mer"), ainsi que l'historique de tous ses séjours et factures.

---

# 5. Module Réservations (Cycle de Vie)
* **Objectif** : Enregistrer et suivre le flux des locations futures.
* **Composants d'écran** :
  * **Formulaire de réservation** : Sélection du client, de la période, de la catégorie de chambre et attribution d'une chambre physique disponible. Calcul automatique du devis estimé.
  * **Gestionnaire d'état de réservation** : Boutons d'action contextuels selon l'avancement : *Confirmer*, *Enregistrer Acompte*, *Check-in*, *Annuler*, *Signaler No Show*.

---

# 6. Module Finance (Facturation & Paiements)
* **Objectif** : Garantir l'encaissement et émettre les documents fiscaux conformes.
* **Composants d'écran** :
  * **Gestionnaire de Folio** : Vue centralisée regroupant tous les débits associés à un séjour (nuitées, consommations restaurant, suppléments).
  * **Formulaire d'encaissement** : Saisie du montant et sélection du mode de paiement (Espèces, Mobile Money Orange/MTN, Carte Visa/Mastercard). Génération instantanée d'un reçu imprimable.
  * **Écran Émission de Facture** : Génère le document final formalisé avec numéro séquentiel unique, calcul de TVA et taxe de séjour, informations légales de l'hôtel et pied de page personnalisé.

---

# 7. Module Restaurant (Menu & Commandes)
* **Objectif** : Gérer la prise de commande et l'affectation aux factures de chambres.
* **Composants d'écran** :
  * **Interface de prise de commande (POS de table)** : Grille des produits du menu filtrés par sous-catégories (Boissons, Brunch Bouaké spécialités, Cocktails). Prise de commande rapide avec notes cuisine.
  * **Options de règlement** : Paiement immédiat (génère un reçu de vente direct) ou transfert sur le numéro de chambre du client (sélection de la chambre occupée, validation de la signature client).

---

# 8. Module Housekeeping (Gouvernance)
* **Objectif** : Suivre l'entretien des chambres pour une remise en location rapide.
* **Composants d'écran** :
  * **Tableau de bord de nettoyage** : Liste des chambres triées par priorité (ex. : les chambres dont les clients arrivent aujourd'hui apparaissent en rouge clignotant).
  * **Changement d'état** : Le personnel de chambre met à jour l'avancement (*À nettoyer*, *En cours*, *Terminé*). La gouvernante générale accède au bouton *Inspecter et valider* pour repasser la chambre en statut *Libre*.

---

# 9. Module Maintenance (Tickets Techniques)
* **Objectif** : Réduire le temps d'indisponibilité des chambres en panne.
* **Composants d'écran** :
  * **Création de ticket de panne** : Sélection de la chambre, titre de l'incident, description, sévérité (Faible, Moyenne, Haute, Critique).
  * **Suivi technique** : Liste des tickets actifs avec assignation d'un technicien. Le technicien met à jour le statut du ticket (*En cours*, *Résolu*, *Fermé*).

---

# 10. Module Gestion des Stocks
* **Objectif** : Gérer les produits consommables (boissons, ingrédients restaurant, fournitures d'entretien).
* **Composants d'écran** :
  * **Tableau d'inventaire** : Affichage des quantités physiques restantes, prix d'achat moyen et seuils d'alerte.
  * **Formulaire de mouvement de stock** : Enregistre les entrées de marchandises (bons de commande fournisseur) et les sorties manuelles (pertes, casse, consommation interne).

---

# 11. Module Rapports & Statistiques
* **Objectif** : Analyser les performances commerciales et opérationnelles de l'hôtel.
* **Composants d'écran** :
  * **Graphiques d'occupation** : Courbe mensuelle du taux d'occupation et du prix moyen par nuitée (RevPAR).
  * **Rapport des recettes** : Tableau des encaissements regroupés par mode de paiement et par type de vente (Chambres vs Restaurant).
  * **Export des données** : Boutons d'extraction instantanée de tous les rapports au format Excel, CSV ou impression PDF.

---

# 12. Module Paramètres de l'Établissement
* **Objectif** : Rendre la plateforme totalement autonome et paramétrable sans intervention sur le code.
* **Composants d'écran** :
  * **Fiche Établissement** : Saisie du nom, adresse, email, téléphone, logo, site internet, RCCM et NIF.
  * **Configuration financière** : Activation de la TVA, taux de taxe de séjour, devise par défaut (XOF, EUR, USD), et définition des coordonnées bancaires pour les factures.
  * **Gestion des Utilisateurs & Rôles** : Liste des comptes du personnel, assignation des rôles RBAC et désactivation de comptes.

---

**Fin du document – 05_MODULE_SPECIFICATIONS.md**
