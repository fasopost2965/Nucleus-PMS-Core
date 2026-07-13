# 33_BACKEND_ARCHITECTURE.md

**Projet :** Nucleus PMS Core
**Instance de référence :** Brunch Bouaké PMS
**Version :** 1.0
**Document :** Architecture et Organisation du Code Backend (API REST)

---

# 1. Introduction

Le backend de **Nucleus PMS Core** est une API REST développée sous Node.js et Express. Elle est écrite en TypeScript et compilée en CommonJS (`.cjs`) pour le déploiement sur Hostinger. 

Le backend est le garant absolu des règles métier, de l'intégrité de la base de données et de la sécurité d'accès. Aucune opération d'écriture en base de données n'est permise sans authentification et validation préalables.

---

# 2. Organisation des Dossiers (Structure API)

La structure de l'API REST suit le principe de la séparation des responsabilités (Separation of Concerns) :

```text
server/
 ├── config/            # Configurations de base (MySQL Connection, JWT Config)
 ├── middlewares/       # Intercepteurs (Auth, RBAC check, Error handler, Audit logger)
 ├── controllers/       # Gestionnaires de requêtes (Logique applicative et orchestration)
 ├── services/          # Logique métier pure, calculs financiers et transactions DB
 ├── validations/       # Schémas Zod pour la validation stricte des payloads d'entrée
 └── routes/            # Déclarations des endpoints et association avec les contrôleurs
```

---

# 3. Middlewares Fondamentaux

## 3.1. Authentification (`authMiddleware.ts`)
* Intercepte toutes les requêtes (sauf `/api/auth/login`).
* Vérifie la validité du Token JWT passé dans le header `Authorization: Bearer <token>`.
* Injecte les données de l'utilisateur (`req.user = { id, role, email }`) dans le contexte de la requête.

## 3.2. Autorisation & RBAC (`rbacMiddleware.ts`)
* Valide que le rôle de l'utilisateur connecté possède la permission requise pour l'action et le module ciblés.
* Exemple d'utilisation dans une route :
```typescript
router.post('/reservations', authMiddleware, rbacMiddleware('reservations', 'create'), reservationController.create);
```

## 3.3. Traçabilité Active (`auditMiddleware.ts`)
* Intercepte toutes les requêtes d'écriture réussies (`POST`, `PUT`, `PATCH`, `DELETE`).
* Enregistre automatiquement l'action, l'utilisateur, l'adresse IP et l'ID de la ressource impactée dans la table `audit_logs`.

---

# 4. Gestion des Transactions et Intégrité Financière

Toutes les opérations complexes impliquant plusieurs tables doivent s'exécuter dans des **transactions SQL** pour garantir l'atomicité (soit tout réussit, soit tout est annulé).

### Exemple de processus transactionnel de Check-out :
1. **Étape 1** : Lecture et verrouillage du Folio de séjour.
2. **Étape 2** : Calcul des taxes et validation du montant total dû.
3. **Étape 3** : Création de la facture finale en statut `final`.
4. **Étape 4** : Enregistrement de la transaction de paiement dans la table `payments`.
5. **Étape 5** : Mise à jour du statut de la réservation à `checked_out`.
6. **Étape 6** : Passage automatique de l'état de la chambre à `dirty` (`À nettoyer`).
7. **Étape 7** : Enregistrement dans le journal d'audit.

*Si l'une de ces étapes échoue, un `ROLLBACK` SQL est immédiatement déclenché pour ramener la base de données à son état d'origine.*

---

# 5. Validation Stricte des Données (Zod)

Le backend n'accepte aucune entrée utilisateur sans validation. Les schémas Zod garantissent que les types, longueurs et formats de données sont parfaits avant tout traitement métier.

```typescript
// Exemple de validation de création de réservation
import { z } from "zod";

export const CreateReservationSchema = z.object({
  guestId: z.number().int().positive("L'ID client est requis"),
  roomId: z.number().int().positive("L'ID de la chambre est requis"),
  source: z.enum(["walk_in", "phone", "booking_com", "website", "other"]),
  checkInDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date d'arrivée invalide (AAAA-MM-JJ)"),
  checkOutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date de départ invalide (AAAA-MM-JJ)"),
  numberOfGuests: z.number().int().min(1, "Au moins 1 occupant requis").max(6, "Capacité maximale dépassée"),
  notes: z.string().optional()
});
```

---

# 6. Gestion Globale des Erreurs (`errorHandler.ts`)

Toutes les exceptions et erreurs système sont capturées par un middleware centralisé, évitant de divulguer des détails techniques de la base de données (ex. : requêtes SQL brutes) à l'utilisateur :

```typescript
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(`[API Error] : ${err.message}`);
  
  // Format standardisé de retour d'erreur
  const status = err.status || 500;
  const message = err.message || "Une erreur interne est survenue sur le serveur";
  
  res.status(status).json({
    success: false,
    error: {
      message,
      code: err.code || "INTERNAL_SERVER_ERROR",
      details: err.details || null
    }
  });
}
```

---

**Fin du document – 33_BACKEND_ARCHITECTURE.md**
