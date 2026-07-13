# 03_ARCHITECTURE_DESIGN.md

**Projet :** Nucleus PMS Core
**Instance de référence :** Brunch Bouaké PMS
**Version :** 1.0
**Document :** Conception de l'Architecture Technique de la Plateforme

---

# 1. Architecture Globale

**Nucleus PMS Core** est structuré comme une application web full-stack découplée en trois couches distinctes :
1. **Couche Présentation (Frontend)** : Single Page Application (SPA) ultra-réactive développée en React 19, typée avec TypeScript, stylisée avec Tailwind CSS et optimisée pour des chargements inférieurs à 1.5 seconde.
2. **Couche Services (Backend)** : Serveur API REST léger sous Node.js et Express, sécurisé par JWT, assurant l'application stricte des règles métier et l'interfaçage avec les systèmes tiers (ex: passerelles Mobile Money, connecteurs OTA).
3. **Couche Données (Database)** : Base de données relationnelle MySQL (gérée via Prisma ORM ou directement en MySQL natif sur Hostinger), garantissant la cohérence transactionnelle et l'historisation systématique.

---

# 2. Schéma d'Architecture de Déploiement (Production Hostinger)

```text
               ┌──────────────────────────────┐
               │    Client Web (Navigateur)   │
               └──────────────┬───────────────┘
                              │ HTTPS (Port 443)
                              ▼
               ┌──────────────────────────────┐
               │      Proxy Web / Nginx       │
               └──────────────┬───────────────┘
                              │
               ┌──────────────┴───────────────┐
               │                              │
               ▼ /                            ▼ /api/*
┌──────────────────────────────┐┌──────────────────────────────┐
│  Frontend Statique (SPA)     ││  API REST Node.js (Port 3000)│
│  Fichiers HTML/JS compilés   ││  Express Server              │
└──────────────────────────────┘└──────────────┬───────────────┘
                                               │ SQL (Port 3306)
                                               ▼
                                ┌──────────────────────────────┐
                                │      Base de données MySQL   │
                                └──────────────────────────────┘
```

---

# 3. Spécificités de l'Architecture de Développement (AI Studio Preview)

Dans l'environnement de bac à sable AI Studio, l'application fonctionne sous une configuration de proxy unique :
* **Port unique** : Le port **3000** est l'unique port exposé à l'extérieur.
* **Serveur Express Hybride** : Le serveur Express (`server.ts`) s'exécute sur le port 3000. 
  * En mode développement (`NODE_ENV !== "production"`), il intègre le middleware Vite pour servir dynamiquement les fichiers sources de l'application React et gérer le Hot Reloading sans conflit de port.
  * En mode production (`NODE_ENV === "production"`), il sert les fichiers statiques pré-compilés du dossier `dist/` tout en exposant les routes API sur `/api/*`.

---

# 4. Stratégie de Compilation et Build (Production)

Pour contourner les contraintes de résolution d'imports ES Modules en production sous Node.js, l'application utilise une méthode de bundling unifié via **esbuild** :
* **Commande de Build** : `npm run build`
  1. Le compilateur Vite build le frontend et génère les fichiers statiques optimisés dans `/dist`.
  2. `esbuild` compile et bundle l'intégralité du code backend (`server.ts` et dépendances associées) dans un fichier unique au format CommonJS : `dist/server.cjs`.
* **Exécution en Production** : `node dist/server.cjs` (géré par le script `"start"` de `package.json`). Cette approche garantit un démarrage quasi instantané et évite tout conflit de chemin relatif de fichier.

---

# 5. Modularité et Scalabilité

Le système est découplé pour être prêt pour le SaaS et le multi-tenant :
* **Couche d'Abstraction des Paramètres** : Aucune valeur spécifique à l'hôtel ou à sa fiscalité n'est codée en dur. Une table `settings` en base de données permet d'injecter dynamiquement la devise, le fuseau horaire, les taxes applicables, et les informations légales dans les rendus frontend et backend.
* **Architecture Orientée Services** : Les modules comme le Restaurant, les Stocks ou la Maintenance disposent de services isolés au sein de l'API. Cette isolation permettra d'extraire ces modules en microservices ou de les synchroniser avec des applications dédiées (ex: tablette serveur en salle pour le restaurant) à l'avenir.
* **Sélection Technologique** :
  * **lucide-react** : Bibliothèque unique d'icônes vectorielles.
  * **recharts** : Moteur de rendu graphique pour les dashboards opérationnels et rapports financiers.
  * **motion** : Librairie d'animation haute performance pour des transitions d'écrans fluides et professionnelles.

---

**Fin du document – 03_ARCHITECTURE_DESIGN.md**
