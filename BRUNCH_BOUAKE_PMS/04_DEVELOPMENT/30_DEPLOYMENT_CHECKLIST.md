# 30_DEPLOYMENT_CHECKLIST.md

**Projet :** Nucleus PMS Core
**Instance de référence :** Brunch Bouaké PMS
**Version :** 1.0
**Document :** Procédure Officielle de Déploiement en Production (Hostinger)

---

# 1. Objectif

Ce document fournit la liste de contrôle exhaustive des étapes obligatoires pour déploier avec succès, sécurité et reproductibilité l'application **Nucleus PMS Core** (et son instance Brunch Bouaké PMS) sur un hébergement Hostinger (ou infrastructure similaire).

---

# 2. Pré-requis d'Infrastructure

* **Serveur Web / VPS ou Hébergement Cloud** avec support Node.js LTS activé.
* **Base de données MySQL** 8.0+ disponible et accessible.
* **Certificat SSL (HTTPS)** configuré pour le domaine de production (ex : `https://pms.brunchbouake.com`).

---

# 3. Variables d'Environnement (Fichier `.env`)

Le fichier de configuration `.env` doit être créé et sécurisé sur le serveur hôte avec les variables suivantes :

```env
NODE_ENV=production
APP_NAME="Brunch Bouaké PMS"
APP_URL=https://pms.votre-domaine.com
PORT=3000

# Base de données MySQL
DATABASE_URL=mysql://USER:PASSWORD@HOST:3306/brunch_pms

# Sécurité & Tokens
JWT_SECRET=generer_cle_securisee_de_32_caracteres_minimum
JWT_EXPIRES_IN=7d
SESSION_SECRET=generer_cle_de_session_securisee

# Stockage et Dossiers de Téléchargement
UPLOAD_PATH=/public_html/uploads
BACKUP_PATH=/public_html/backups

# Paramètres Régionaux par défaut
DEFAULT_CURRENCY=XOF
DEFAULT_LANGUAGE=fr
TIMEZONE=Africa/Abidjan

# Configuration SMTP (Envoi d'e-mails, ex : codes de réinitialisation)
SMTP_HOST=mail.votre-domaine.com
SMTP_PORT=465
SMTP_USER=no-reply@votre-domaine.com
SMTP_PASSWORD=MotDePasseSmtpSecurise
SMTP_FROM=no-reply@votre-domaine.com
```

> ⚠️ Sur un hébergement Node.js géré (Hostinger "Setup Node.js App"), le fichier
> `.env` n'est utile qu'en local. En production, ces variables doivent être
> saisies dans la section **"Environment variables"** du panneau Node.js de
> l'hébergeur — c'est ce mécanisme qui injecte réellement les valeurs dans
> `process.env` au démarrage de l'application.

---

# 4. Procédure de Compilation et Déploiement

```text
[Développement local / Git]
             │
             ▼
[Exécuter le build unifié] ──► `npm run build`
             │
             ▼
[Production des fichiers compilés]
   ├── Frontend React  ──► Dossier `/dist` (Fichiers statiques)
   └── Backend Node.js ──► Fichier `/dist/server.cjs` (Bundle CommonJS)
             │
             ▼
[Déploiement FTP ou Git Pull sur Hostinger]
             │
             ▼
[Installation des dépendances de production] ──► `npm install --production`
             │
             ▼
[Exécuter les migrations de base de données] ──► `npx prisma db push` ou import SQL initial
             │
             ▼
[Lancement du serveur applicatif via PM2] ──► `pm2 start dist/server.cjs --name "nucleus-pms"`
```

---

# 5. Plan de Sauvegarde et de Restauration (Disaster Recovery)

* **Base de données** : Sauvegarde planifiée quotidienne automatique de la base de données MySQL via un script CRON Hostinger avec conservation des fichiers SQL compressés pendant 30 jours minimum.
* **Fichiers Uploads** : Archivage hebdomadaire du dossier `/public_html/uploads`.
* **Procédure de Restauration rapide** :
  1. Activer le mode maintenance (affichage d'une page statique d'attente pour les utilisateurs).
  2. Restaurer la structure et les données à partir du dernier fichier de sauvegarde SQL : `mysql -u USER -p DATABASE < backup.sql`.
  3. Relancer l'instance Node.js via PM2.
  4. Valider le retour en ligne de l'application et désactiver le mode maintenance.

---

**Fin du document – 30_DEPLOYMENT_CHECKLIST.md**
