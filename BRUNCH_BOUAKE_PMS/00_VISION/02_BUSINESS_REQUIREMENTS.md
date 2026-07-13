# 02_BUSINESS_REQUIREMENTS.md

**Projet :** Nucleus PMS Core
**Instance de référence :** Brunch Bouaké PMS
**Version :** 1.0
**Document :** Spécifications des Exigences Métier et Workflows

---

# 1. Introduction & Objectif

Ce document définit les exigences fonctionnelles et non-fonctionnelles, les règles de gestion métier, et les workflows opérationnels de la plateforme **Nucleus PMS Core**. C'est le contrat fonctionnel liant l'ingénierie et l'exploitation hôtelière.

---

# 2. Exigences Générales

* **Multi-utilisateurs & RBAC** : La plateforme applique un contrôle d'accès strict basé sur les rôles (Role-Based Access Control). Toutes les requêtes API sont authentifiées et soumises aux permissions du rôle de l'utilisateur connecté.
* **Sécurité & Traçabilité** : 
  * Aucun code ou calcul financier critique ne doit s'exécuter côté client sans validation backend.
  * Toutes les actions d'écriture (Création, Modification, Validation, Annulation, Paiement, Changement de rôle) doivent être consignées dans un journal d'audit (`audit_logs`) non modifiable.
* **Intégrité des données** : Les suppressions physiques sont formellement interdites pour les entités clés (clients, réservations, factures, transactions). Le système utilise le mécanisme de "Soft Delete" (archivage logique ou mise à jour de statut).

---

# 3. Règles Métier par Module

## 3.1. Gestion des Chambres et Catégories
1. Une chambre est caractérisée par son numéro, son étage, sa catégorie (ex. : Standard, Executive, Suite Cacao), sa tarification de base et son statut opérationnel.
2. Une chambre possède un seul statut opérationnel à un instant donné.
   * **Statuts autorisés** : `Libre`, `Réservée`, `Occupée`, `À nettoyer`, `Inspection`, `Maintenance`, `Hors service`.
3. Une chambre en statut `Maintenance` ou `Hors service` ne peut pas être attribuée à une réservation.
4. Le statut passe automatiquement à `À nettoyer` immédiatement après un check-out.
5. Une chambre ne peut retourner en statut `Libre` qu'après validation du statut `Inspection` par la gouvernante générale ou un réceptionniste habilité.

## 3.2. Cycle de Vie des Réservations
1. Une réservation doit obligatoirement être rattachée à :
   * Un client principal unique.
   * Au moins une chambre de l'établissement.
   * Une période de séjour valide (date d'arrivée < date de départ).
2. **Statuts d'une réservation** : `Brouillon`, `En attente` (acompte), `Confirmée`, `Check-in` (En séjour), `Check-out` (Terminée), `Annulée`, `No Show`.
3. Le prix de la nuitée est définitivement **figé** au moment de la confirmation de la réservation. Les modifications ultérieures des tarifs de base de la catégorie n'impactent pas rétroactivement les séjours en cours ou confirmés.
4. Une chambre ne peut pas être attribuée à deux réservations distinctes sur des périodes qui se chevauchent (Contrôle strict anti-surbooking).

## 3.3. Facturation et Comptabilité
1. Une facture est associée de manière immuable à une réservation/séjour.
2. Une facture confirmée **ne peut jamais être supprimée ou modifiée** (exigence fiscale). En cas d'erreur de facturation, une facture d'avoir (annulation par contre-écriture) doit être émise.
3. Le calcul de la facture intègre :
   * Les nuitées de séjour (calculées d'après le prix de la chambre figé par nuit).
   * Les taxes configurées (TVA, Taxe de séjour par nuit par personne).
   * Les remises (soumises à validation spéciale si > 20%).
   * Les suppléments (restaurant, minibar, blanchisserie).
4. Un paiement enregistré est irréversible. Toute annulation de transaction doit être justifiée par un flux de remboursement ou une contre-écriture comptable dans le journal.

## 3.4. Gestion du Restaurant et des Commandes
1. Les articles du menu de restaurant appartiennent à des catégories précises.
2. Une commande de restaurant peut être réglée immédiatement (moyen de paiement direct) ou être rattachée au folio de séjour d'une chambre active pour facturation finale au check-out.
3. Seul un séjour en statut `En séjour` (Check-in actif) peut recevoir des transferts de commandes restaurant sur sa facture de chambre.

## 3.5. Gestion des Stocks et Inventaire
1. Les produits en stock possèdent un seuil de sécurité.
2. Tout mouvement de stock (Entrée par achat/fournisseur, Sortie par consommation restaurant ou housekeeping) doit générer une fiche de mouvement enregistrant l'auteur et la quantité exacte.
3. L'ajustement d'inventaire suite à un comptage manuel doit être validé par un utilisateur ayant le rôle Administrateur Fonctionnel ou Directeur.

---

# 4. Workflows Métier Clés

## 4.1. Réservation et Acompte
```text
[Nouvelle demande client]
         │
         ▼
[Vérification Disponibilité] ──► (Si indisponible: Proposition d'une autre catégorie)
         │
         ▼
[Saisie Client ou Sélection Fiche Existante]
         │
         ▼
[Calcul du devis & Choix Chambre]
         │
         ▼
[Réservation "En attente"] (Statut transitoire)
         │
         ▼
[Paiement de l'acompte (Optionnel / selon politique)]
         │
         ▼
[Réservation "Confirmée"]
```

## 4.2. Arrivée (Check-in)
* **Conditions préalables** : Chambre en état `Libre` ou `Réservée`, client identifié, dossier complet (pièce d'identité enregistrée).
* **Processus** :
  1. Accueil du client et vérification de la réservation.
  2. Saisie/mise à jour des documents d'identité dans la fiche client.
  3. Enregistrement du solde d'acompte (si requis).
  4. Validation du check-in dans le PMS.
  5. Le statut de la chambre passe automatiquement à `Occupée`.
  6. Le statut de la réservation passe à `En séjour`.

## 4.3. Départ (Check-out)
* **Processus** :
  1. Libération de la chambre par le client.
  2. Contrôle housekeeping (minibar, état de la chambre).
  3. Clôture de la facture (Folio) : consolidation des nuitées, commandes restaurant, taxes et déduction des acomptes versés.
  4. Encaissement du solde final par le moyen de paiement sélectionné (Espèces, Mobile Money, Carte).
  5. Validation du check-out dans le PMS.
  6. Impression de la facture certifiée conforme.
  7. Le statut de la chambre passe automatiquement à `À nettoyer`.
  8. Le statut de la réservation passe à `Check-out`.

## 4.4. Cycle d'entretien des Chambres (Housekeeping)
```text
[Chambre Occupée] ──► (Check-out client) ──► [Statut: À nettoyer]
                                                    │
                                                    ▼
                                            [Nettoyage en cours]
                                                    │
                                                    ▼
                                            [Statut: Inspection] (Par gouvernante)
                                                    │
                                                    ▼
                                            [Statut: Libre]
```

## 4.5. Signalement et Résolution de Panne (Maintenance)
1. Découverte d'une panne (par le client, la réception ou le housekeeping).
2. Création d'un ticket de maintenance avec niveau de gravité (`Faible`, `Moyen`, `Critique`).
3. Si la gravité est **Critique** : La chambre passe immédiatement en statut `Maintenance` et est bloquée à la réservation.
4. Affectation du ticket au technicien.
5. Résolution de la panne, mise à jour des notes techniques et clôture du ticket.
6. La chambre repasse en statut `À nettoyer` pour inspection avant réouverture à la location.

## 4.6. Clôture de Journée (Night Audit)
Chaque jour à 23h59 (ou heure paramétrée) :
1. Vérification de l'absence de check-in en attente (no-show ou arrivées tardives non traitées).
2. Vérification des réservations devant quitter l'établissement aujourd'hui mais toujours actives (check-out en retard).
3. Consolidation et archivage du journal des ventes et des recettes de la journée.
4. Ouverture de la nouvelle journée comptable dans le système.

---

**Fin du document – 02_BUSINESS_REQUIREMENTS.md**
