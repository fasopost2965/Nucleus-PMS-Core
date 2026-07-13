# 04_DATABASE_DESIGN.md

**Projet :** Nucleus PMS Core
**Instance de référence :** Brunch Bouaké PMS
**Version :** 1.0
**Document :** Modèle de Données et Schéma de Base de Données Relationnelle

---

# 1. Introduction

La base de données relationnelle de **Nucleus PMS Core** est conçue pour être déployée sur un serveur **MySQL** (ex: MySQL 8 ou MariaDB sur Hostinger). Ce document détaille l'organisation physique des tables, les clés primaires/étrangères, les contraintes d'intégrité et les index optimisés pour les requêtes à forte fréquence (dashboard, calendrier).

---

# 2. Modèle Conceptuel de Données (MCD)

```text
  ┌──────────┐         ┌──────────────┐         ┌─────────────┐
  │  Guests  │◄────────┤ Reservations │────────►│    Rooms    │
  └────┬─────┘         └──────┬───────┘         └──────┬──────┘
       │                      │                        │
       ▼                      ▼                        ▼
  ┌────┴─────┐         ┌──────┴───────┐         ┌──────┴──────┘
  │ Invoices │◄────────┤   Payments   │         │ Housekeeping│
  └──────────┘         └──────────────┘         └─────────────┘
```

---

# 3. Schéma Physique des Tables (SQL de Référence)

## 3.1. Administration & Sécurité

### Table `roles`
Stocke les rôles de sécurité (RBAC).
```sql
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table `role_permissions`
Définit les permissions spécifiques par module pour chaque rôle.
```sql
CREATE TABLE role_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    module VARCHAR(50) NOT NULL, -- e.g., 'reservations', 'finance'
    action VARCHAR(50) NOT NULL, -- e.g., 'view', 'create', 'approve'
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    UNIQUE KEY uq_role_permission (role_id, module, action)
);
```

### Table `users`
Stocke les fiches utilisateurs.
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'suspended', 'disabled'
    timezone VARCHAR(50) DEFAULT 'Africa/Abidjan',
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);
```

---

## 3.2. Configuration de l'Hôtel

### Table `hotel_settings`
Données dynamiques d'identification et de règles de l'hôtel-SaaS.
```sql
CREATE TABLE hotel_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hotel_name VARCHAR(100) NOT NULL,
    legal_name VARCHAR(150),
    address VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(100),
    website VARCHAR(100),
    currency VARCHAR(10) DEFAULT 'XOF',
    timezone VARCHAR(50) DEFAULT 'Africa/Abidjan',
    tva_rate DECIMAL(5,2) DEFAULT 18.00,
    tourist_tax_rate INT DEFAULT 500, -- en XOF par nuit
    invoice_prefix VARCHAR(10) DEFAULT 'FA',
    invoice_start_number INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Table `room_categories`
Catégories de chambres (Standard, Suite, Cacao VIP).
```sql
CREATE TABLE room_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    base_price_per_night DECIMAL(10,2) NOT NULL,
    capacity INT NOT NULL DEFAULT 2,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table `rooms`
Chambres physiques de l'établissement.
```sql
CREATE TABLE rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    room_number VARCHAR(10) NOT NULL UNIQUE,
    floor VARCHAR(10),
    status VARCHAR(30) NOT NULL DEFAULT 'available', -- 'available', 'reserved', 'occupied', 'dirty', 'maintenance', 'out_of_service'
    observations TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES room_categories(id)
);
```

---

## 3.3. Clients & Séjours

### Table `guests`
```sql
CREATE TABLE guests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(30) NOT NULL,
    identity_document_type VARCHAR(50), -- 'passport', 'cni', 'driver_license'
    identity_document_number VARCHAR(100),
    nationality VARCHAR(50),
    preferences TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Table `reservations`
```sql
CREATE TABLE reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    guest_id INT NOT NULL,
    room_id INT NOT NULL,
    source VARCHAR(50) NOT NULL DEFAULT 'walk_in', -- 'walk_in', 'phone', 'booking_com', 'website'
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    number_of_guests INT NOT NULL DEFAULT 1,
    status VARCHAR(30) NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show'
    price_per_night DECIMAL(10,2) NOT NULL, -- Prix gelé à la confirmation
    notes TEXT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (guest_id) REFERENCES guests(id),
    FOREIGN KEY (room_id) REFERENCES rooms(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

---

## 3.4. Facturation, Paiements & Restaurant

### Table `invoices`
```sql
CREATE TABLE invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reservation_id INT NOT NULL,
    invoice_number VARCHAR(30) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'draft', -- 'draft', 'proforma', 'final', 'cancelled', 'refunded'
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    tva_amount DECIMAL(10,2) NOT NULL,
    tourist_tax_amount DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reservation_id) REFERENCES reservations(id)
);
```

### Table `payments`
```sql
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(30) NOT NULL, -- 'cash', 'card', 'mobile_money', 'wire_transfer'
    transaction_reference VARCHAR(100),
    recorded_by INT NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id),
    FOREIGN KEY (recorded_by) REFERENCES users(id)
);
```

### Table `restaurant_menu_items`
```sql
CREATE TABLE restaurant_menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(50) NOT NULL, -- 'brunch', 'cocktails', 'plats', 'desserts'
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    is_available BOOLEAN DEFAULT TRUE
);
```

### Table `restaurant_orders`
```sql
CREATE TABLE restaurant_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reservation_id INT NULL, -- NULL si client externe direct (walk-in resto)
    status VARCHAR(30) NOT NULL DEFAULT 'open', -- 'open', 'completed', 'cancelled'
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    is_charged_to_room BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reservation_id) REFERENCES reservations(id)
);
```

---

## 3.5. Exploitation : Maintenance, Housekeeping & Stocks

### Table `maintenance_tickets`
```sql
CREATE TABLE maintenance_tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    severity VARCHAR(20) NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    status VARCHAR(20) NOT NULL DEFAULT 'open', -- 'open', 'assigned', 'resolved', 'closed'
    assigned_to INT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### Table `housekeeping_tasks`
```sql
CREATE TABLE housekeeping_tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    assigned_to INT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'inspected'
    notes TEXT,
    scheduled_date DATE NOT NULL,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (room_id) REFERENCES rooms(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id)
);
```

### Table `stock_items`
```sql
CREATE TABLE stock_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    sku VARCHAR(50) UNIQUE,
    category VARCHAR(50) NOT NULL, -- 'boissons', 'ingrédients_brunch', 'produits_entretien'
    quantity_in_stock DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    safety_stock_threshold DECIMAL(10,2) NOT NULL DEFAULT 5.00,
    unit VARCHAR(20) NOT NULL -- 'unit', 'kg', 'liter', 'box'
);
```

---

## 3.6. Traçabilité (Audit Logs)

### Table `audit_logs`
```sql
CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    module VARCHAR(50) NOT NULL, -- e.g., 'reservations', 'billing'
    action VARCHAR(50) NOT NULL, -- e.g., 'check_in', 'void_invoice'
    record_id VARCHAR(50) NULL, -- ID de l'enregistrement affecté
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

# 4. Indexation et Optimisation

Pour garantir un temps de réponse des API inférieur à 2 secondes (exigence de performance globale), les index suivants doivent être mis en place en production :
* `INDEX idx_reservation_dates (check_in_date, check_out_date)` : Accélère les requêtes de recherche de disponibilité de chambres.
* `INDEX idx_rooms_status (status)` : Permet de générer instantanément l'occupation du dashboard.
* `INDEX idx_audit_logs_user (user_id)` : Améliore le temps d'affichage des historiques d'activité utilisateur.
* `INDEX idx_invoice_number (invoice_number)` : Accélère les recherches de folio.

---

**Fin du document – 04_DATABASE_DESIGN.md**
