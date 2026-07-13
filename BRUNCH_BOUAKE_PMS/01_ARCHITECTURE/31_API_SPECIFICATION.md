# 31_API_SPECIFICATION.md

**Projet :** Nucleus PMS Core
**Instance de référence :** Brunch Bouaké PMS
**Version :** 1.0
**Document :** Spécifications de l'API REST du Système

---

# 1. Normes et Standards

L'API de **Nucleus PMS Core** applique les principes REST :
* **Préfixe des routes** : Toutes les routes d'API commencent par `/api`.
* **Format des données** : Les requêtes et réponses s'effectuent au format `application/json`.
* **Codes de statut HTTP** :
  * `200 OK` : Succès de la requête.
  * `201 Created` : Création de ressource réussie.
  * `400 Bad Request` : Payload invalide (erreur de validation Zod).
  * `401 Unauthorized` : Token JWT manquant ou expiré.
  * `403 Forbidden` : Permissions insuffisantes pour exécuter l'action.
  * `404 Not Found` : Ressource introuvable.
  * `500 Internal Server Error` : Erreur serveur.

---

# 2. Endpoints de l'API REST

## 2.1. Authentification (`/api/auth`)

### `POST /api/auth/login`
Authentifie un utilisateur et renvoie un token JWT.
* **Payload de requête** :
```json
{
  "email": "user@nucleus-pms.com",
  "password": "SecurePassword123"
}
```
* **Réponse de succès (200)** :
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 5,
    "firstName": "Jean",
    "lastName": "Kouadio",
    "email": "user@nucleus-pms.com",
    "role": "Directeur"
  }
}
```

---

## 2.2. Dashboard (`/api/dashboard`)

### `GET /api/dashboard`
Récupère les indicateurs clés (KPI) et les widgets opérationnels du jour.
* **Réponse de succès (200)** :
```json
{
  "success": true,
  "data": {
    "occupancyRate": 74.5,
    "occupiedRooms": 15,
    "availableRooms": 5,
    "dirtyRooms": 3,
    "maintenanceRooms": 2,
    "revenueToday": 450000,
    "arrivalsCount": 4,
    "departuresCount": 6,
    "restaurantOrdersOpen": 2,
    "criticalStockAlerts": 1,
    "urgentMaintenanceTickets": 1
  }
}
```

---

## 2.3. Chambres (`/api/rooms`)

### `GET /api/rooms`
Filtre et renvoie la liste des chambres et leurs statuts.
* **Paramètres de requête (Query params)** : `status` (optionnel), `category` (optionnel).
* **Réponse de succès (200)** :
```json
{
  "success": true,
  "rooms": [
    {
      "id": 101,
      "roomNumber": "101",
      "floor": "1er",
      "status": "occupied",
      "category": "Suite Cacao",
      "pricePerNight": 75000
    }
  ]
}
```

---

## 2.4. Réservations (`/api/reservations`)

### `POST /api/reservations`
Crée une nouvelle réservation de séjour.
* **Payload de requête** :
```json
{
  "guestId": 14,
  "roomId": 101,
  "source": "booking_com",
  "checkInDate": "2026-07-15",
  "checkOutDate": "2026-07-20",
  "numberOfGuests": 2,
  "notes": "Arrivée tardive"
}
```
* **Réponse de succès (201)** :
```json
{
  "success": true,
  "reservationId": 452,
  "status": "confirmed"
}
```

### `POST /api/reservations/:id/check-in`
Effectue le check-in d'un client et bascule la chambre à l'état occupé.
* **Réponse de succès (200)** :
```json
{
  "success": true,
  "message": "Check-in enregistré avec succès",
  "roomStatus": "occupied",
  "reservationStatus": "checked_in"
}
```

---

## 2.5. Clients (`/api/guests`)

### `GET /api/guests`
Recherche des clients dans la base de données.
* **Query params** : `q` (nom, email ou téléphone).
* **Réponse de succès (200)** :
```json
{
  "success": true,
  "guests": [
    {
      "id": 14,
      "firstName": "Assa",
      "lastName": "Diallo",
      "email": "assa.diallo@example.com",
      "phone": "+2250708091011",
      "nationality": "Ivoirienne"
    }
  ]
}
```

---

## 2.6. Facturation et Paiements (`/api/finance`)

### `GET /api/finance/invoices/:id`
Récupère les détails du folio (facture) d'une réservation.
* **Réponse de succès (200)** :
```json
{
  "success": true,
  "invoice": {
    "invoiceNumber": "FA-2026-0034",
    "status": "proforma",
    "guestName": "Assa Diallo",
    "roomNumber": "101",
    "nightsCount": 5,
    "nightsTotal": 375000,
    "restaurantSupplements": 24000,
    "tvaAmount": 71820,
    "touristTaxAmount": 2500,
    "totalDue": 473320,
    "payments": [
      { "amount": 150000, "method": "mobile_money", "date": "2026-07-13" }
    ],
    "balance": 323320
  }
}
```

---

## 2.7. Restaurant (`/api/restaurant`)

### `POST /api/restaurant/orders`
Crée une commande au restaurant de l'hôtel.
* **Payload de requête** :
```json
{
  "reservationId": 452, // NULL si client externe direct
  "isChargedToRoom": true,
  "items": [
    { "menuItemId": 12, "quantity": 2, "notes": "Cuisson d'appoint" }
  ]
}
```
* **Réponse de succès (201)** :
```json
{
  "success": true,
  "orderId": 1045,
  "totalAmount": 24000
}
```

---

**Fin du document – 31_API_SPECIFICATION.md**
