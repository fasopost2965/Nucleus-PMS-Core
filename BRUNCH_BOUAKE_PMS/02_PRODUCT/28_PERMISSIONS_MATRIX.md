# 28_PERMISSIONS_MATRIX.md

**Projet :** Nucleus PMS Core
**Instance de référence :** Brunch Bouaké PMS
**Version :** 1.0
**Document :** Matrice de Droits et Contrôle d'Accès basé sur les Rôles (RBAC)

---

# 1. Introduction et Principes de Sécurité

La sécurité d'accès de **Nucleus PMS Core** est régie par un modèle RBAC strict :
* Les permissions sont accordées de manière exclusive à des **rôles** applicatifs et non à des comptes individuels.
* **Principe du moindre privilège** : Chaque utilisateur ne dispose que des droits strictement nécessaires à l'accomplissement de sa tâche opérationnelle.
* Le frontend applique ce filtrage en masquant les éléments visuels non autorisés (boutons d'action, onglets, liens du menu). Le backend ré-exécute systématiquement cette vérification pour chaque appel API.

---

# 2. Définition des Rôles Applicatifs

## 2.1. Super Administrateur
* **Responsabilité** : Maintenance technique générale de la plateforme.
* **Permissions** : Accès sans restriction à l'ensemble du système, gestion des utilisateurs et rôles, sauvegardes physiques de la base de données, visualisation complète des logs de sécurité (`audit_logs`).

## 2.2. Directeur
* **Responsabilité** : Pilotage stratégique et commercial de l'établissement.
* **Permissions** : Accès complet aux rapports d'activité, validation spéciale des remises de facturation importantes (> 20%), modification de la grille tarifaire des chambres, gestion des fiches clients.
* **Restrictions** : Pas d'accès aux configurations techniques bas niveau (base de données, logs système).

## 2.3. Réception (Front Desk)
* **Responsabilité** : Accueil des clients et gestion courante des séjours.
* **Permissions** : Création et modification de réservations, check-in, check-out, affectation des chambres, enregistrement des paiements directs et des fiches clients, transfert des consommations restaurant sur le folio de chambre.
* **Restrictions** : Pas de suppression de réservation ou de facture, pas de modification des tarifs de base des catégories de chambres.

## 2.4. Comptabilité / Caisse
* **Responsabilité** : Clôture financière et déclaration fiscale.
* **Permissions** : Consultation de toutes les factures et transactions, validation définitive de la caisse journalière, exportation des journaux de vente.
* **Restrictions** : Aucun accès fonctionnel à la gestion des séjours, au housekeeping ou à la maintenance.

## 2.5. Housekeeping (Gouvernance)
* **Responsabilité** : Propreté et libération des chambres pour la location.
* **Permissions** : Consultation du plan d'occupation, modification du statut de propreté des chambres (*À nettoyer*, *En cours*, *Terminé*), signalement d'incidents techniques (création de tickets de maintenance).
* **Restrictions** : Aucun accès aux modules financiers (prix, factures, encaissements).

## 2.6. Maintenance (Technique)
* **Responsabilité** : Entretien physique du bâtiment et résolution des pannes.
* **Permissions** : Visualisation, prise en charge et clôture des tickets de maintenance. Modification du statut de la chambre à *Maintenance* pour les pannes bloquantes.
* **Restrictions** : Aucun accès aux modules de facturation, réservation ou restaurant.

## 2.7. Restaurant (Salle / Brunch)
* **Responsabilité** : Prise de commande et service de restauration.
* **Permissions** : Consultation du menu, création et édition de commandes de restaurant, encaissement de paiements directs ou transfert sur le compte de chambre du client.
* **Restrictions** : Pas d'accès à la modification des fiches de séjour de l'hôtel, pas de consultation des rapports financiers généraux de l'hôtel.

## 2.8. Gestionnaire des Stocks
* **Responsabilité** : Suivi des consommables.
* **Permissions** : CRUD (Créer, Lire, Mettre à jour, Supprimer) sur les fiches produits, enregistrement des bons d'entrée de stock et des ajustements d'inventaire.
* **Restrictions** : Pas d'accès aux réservations, au housekeeping ou à la facturation client.

## 2.9. Auditeur
* **Responsabilité** : Contrôle et conformité.
* **Permissions** : Accès en lecture seule à l'ensemble des modules opérationnels, financiers et historiques d'audit.
* **Restrictions** : Aucune permission d'écriture ou de modification autorisée sur le système.

---

# 3. Matrice de Droits par Module (Permissions de Référence)

| Module | Super Admin | Directeur | Réception | Comptabilité | Housekeeping | Maintenance | Restaurant | Stocks | Auditeur |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Dashboard** | ✔ (All) | ✔ (All) | ✔ (Read) | ✔ (Read) | ✔ (Read) | ✔ (Read) | ✔ (Read) | ✔ (Read) | ✔ (Read) |
| **Chambres** | ✔ (All) | ✔ (All) | ✔ (Read) | - | ✔ (Read) | ✔ (Write) | - | - | ✔ (Read) |
| **Réservations** | ✔ (All) | ✔ (All) | ✔ (CRUD) | - | - | - | - | - | ✔ (Read) |
| **Clients** | ✔ (All) | ✔ (All) | ✔ (CRUD) | ✔ (Read) | - | - | - | - | ✔ (Read) |
| **Facturation** | ✔ (All) | ✔ (All) | ✔ (Write) | ✔ (Write) | - | - | - | - | ✔ (Read) |
| **Paiements** | ✔ (All) | ✔ (All) | ✔ (Write) | ✔ (Write) | - | - | - | - | ✔ (Read) |
| **Restaurant** | ✔ (All) | ✔ (All) | ✔ (Write) | ✔ (Read) | - | - | ✔ (CRUD) | - | ✔ (Read) |
| **Stocks** | ✔ (All) | ✔ (Read) | - | ✔ (Read) | - | - | ✔ (Read) | ✔ (CRUD) | ✔ (Read) |
| **Maintenance** | ✔ (All) | ✔ (All) | ✔ (Write) | - | ✔ (Write) | ✔ (CRUD) | - | - | ✔ (Read) |
| **Housekeeping**| ✔ (All) | ✔ (All) | ✔ (Write) | - | ✔ (CRUD) | - | - | - | ✔ (Read) |
| **Paramètres** | ✔ (All) | ✔ (Func) | - | - | - | - | - | - | ✔ (Read) |
| **Audit Logs** | ✔ (All) | - | - | - | - | - | - | - | ✔ (Read) |

*Légende :*
* **✔ (All)** : Droits administratifs complets (CRUD, Configuration, Validation, Suppression logique).
* **✔ (CRUD)** : Création, Lecture, Modification, Archivage.
* **✔ (Read)** : Lecture seule (Consultation).
* **✔ (Write)** : Saisie et modification autorisées, sans droit de configuration ou de suppression logique.
* **-** : Aucun accès visuel ou technique.

---

**Fin du document – 28_PERMISSIONS_MATRIX.md**
