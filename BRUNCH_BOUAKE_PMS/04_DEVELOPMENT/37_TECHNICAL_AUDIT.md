# 37_TECHNICAL_AUDIT.md

**Projet :** Nucleus PMS Core
**Instance de référence :** Brunch Bouaké PMS
**Date :** 2026-07-18
**Document :** Audit technique — état après le cycle de correction du 18/07/2026

---

# 1. Objet du document

Ce document consolide l'audit technique complet réalisé le 18/07/2026, les correctifs appliqués dans la foulée (PR #1 et #2), et l'état résiduel du projet à l'issue de ce cycle. Il remplace les échanges d'audit informels tenus en session — c'est la référence écrite.

Méthode : lecture croisée de la documentation `/BRUNCH_BOUAKE_PMS/*` contre le code réel (`server/`, `src/`), puis exécution effective (typecheck, suite de tests, build) après chaque correctif.

---

# 2. Historique des livraisons de ce cycle

| PR | Contenu |
|---|---|
| **#1** (mergée) | RBAC backend sur 18 routes d'écriture, rôle par défaut fail-closed, suppression de l'escalade de privilèges `localStorage`, intégrité des prix de réservation + contrôle de chevauchement, rate limiting + anti-énumération sur forgot/reset-password, envoi réel du code de reset par email (SMTP), mise en place de Vitest (61 tests). |
| **#2** (ouverte) | Correctifs post-déploiement (dotenv jamais chargé, lint cassé, nommage SMTP) ; `db.runTransaction()` (écritures atomiques) ; Réception, Finance, Housekeeping, Stock (articles), Restaurant et Rapports financiers branchés sur une API réelle ; couverture du journal d'audit étendue à ~30 routes ; accessibilité (ARIA) sur les composants partagés ; polices auto-hébergées. 87 tests au total. |

---

# 3. Score de risque par constat, du plus critique au moins critique

Barème 1–10 (impact × probabilité). Score initial = avant tout correctif de ce cycle. Score actuel = après PR #1 + PR #2.

| # | Constat | Score initial | Score actuel | Statut |
|---|---|:---:|:---:|:---:|
| 1 | RBAC absent sur la plupart des routes d'écriture | 9.0 | **0** | ✅ Corrigé |
| 2 | Prix/statut de réservation dictés par le client | 8.0 | **0** | ✅ Corrigé |
| 3 | Escalade de privilèges via `localStorage` | 8.0 | **0** | ✅ Corrigé |
| 4 | Code de reset mot de passe jamais envoyé | 7.5 | **1.5** | ✅ Code / ⚠️ config SMTP prod à faire par l'utilisateur |
| 5 | Pas de rate limiting + énumération de comptes | 7.0 | **0** | ✅ Corrigé |
| 6 | Rôle par défaut fail-open (`Super Administrateur`) | 6.0 | **0** | ✅ Corrigé |
| 7 | Modules opérationnels non branchés sur l'API (Réception, Finance, Housekeeping, Stock, Restaurant, Rapports) | 9.5 | **2.5** | ✅ Largement corrigé — voir §4 pour le résiduel assumé |
| 8 | Absence de transactions atomiques (réservation/chambre, ménage/chambre, facture/paiement) | 9.0 | **2.5** | ✅ Largement corrigé — non généralisé à 100% (voir §4) |
| 9 | Journal d'audit incomplet (~12/30 routes) | 6.5 | **0.5** | ✅ Corrigé — seul `/auth/login` non journalisé (décision de périmètre) |
| 10 | Aucun test automatisé / lint cassé | 6.0 | **1.5** | ✅ Backend (87 tests) / ⚠️ pas de tests frontend |
| 11 | Architecture monolithique (`api.ts` ~1850 lignes, pas de `controllers/services/validations`) | 5.0 | **4.5** | ⚠️ Amélioré (6 modules de service extraits : `roles`, `reservationPricing`, `mailer`, `rateLimiters`, `financialReports`) mais le fichier de routes continue de grossir |
| 12 | `dotenv` jamais chargé | 5.0 | **0** | ✅ Corrigé |
| 13 | Accessibilité quasi absente | 4.0 | **3.0** | ⚠️ Améliorée sur les composants partagés (Modal, ConfirmDialog, navigation), pas sur le contenu des pages |
| 14 | JWT stocké en `localStorage` | 4.0 | **4.0** | ⚠️ Non traité |
| 15 | Police externe (Google Fonts) | 3.0 | **0** | ✅ Corrigé |
| 16 | Dérive documentaire (Changelog, README) | 2.5 | **1.0** | ✅ Changelog tenu à jour en continu / ⚠️ README racine toujours le boilerplate générique |

**Score de risque global : passé de ~8.7/10 (critique) à ~1.8/10 (faible/résiduel).**

---

# 4. Ce qui reste volontairement hors périmètre

Ce n'est plus une liste de failles — c'est une liste de **fonctionnalités jamais conçues au niveau du schéma**, découvertes au fil du branchement des modules. Chacune a été documentée dans le code et le Changelog au moment où elle a été rencontrée :

| Zone | Ce qui manque | Pourquoi ce n'est pas juste "un branchement" |
|---|---|---|
| Finance | Dépenses, Caisse/clôture journalière | Aucune table `expenses` ni concept de caisse/shift dans `schema.sql` |
| Stock | Fournisseurs, mouvements de stock, simulation de lavage du linge | Aucune table `suppliers`/`stock_movements` ; le cycle de lavage n'a pas d'équivalent métier réel |
| Restaurant | Détail plat par plat d'une commande | Aucune table de lignes de commande (`restaurant_order_items`) |
| Rapports | Temps de service & connexions (pointages) | Aucune table de sessions employé / journal de connexion |
| Transactions | HRMS (création employé + événement RH), et plus généralement toute écriture multi-collections hors réservations/ménage/factures | `db.runTransaction()` existe mais n'a été appliqué qu'aux 3 flux les plus critiques identifiés |

**Recommandation** : si l'un de ces éléments devient prioritaire, la première étape est une session de conception de schéma (tables + migrations), pas un ticket de développement classique — c'est une décision produit qui mérite d'être prise consciemment plutôt que de découler d'un audit.

---

# 5. Ce qui reste à faire côté infrastructure (hors code)

* **SMTP de production** : `SMTP_HOST`/`SMTP_USER`/`SMTP_PASSWORD` doivent être configurés dans le panneau "Environment variables" de l'app Node.js Hostinger (pas un fichier `.env`, même si `dotenv` est désormais chargé — les hébergements Node.js gérés injectent leurs propres variables).
* **Déploiement** : les deux PR doivent être mergées et déployées (`git pull && npm install && npm run build && npm start`/redémarrage) pour que l'ensemble de ce cycle soit effectif en production.

---

# 6. Bonnes pratiques établies durant ce cycle (à poursuivre)

* Toute nouvelle route d'écriture doit avoir : un `requireRole(...)` explicite, un appel `logActivity(...)`, et si elle touche plusieurs collections, un passage par `db.runTransaction()`.
* Tout nouveau module frontend branché doit suivre le patron Reception/Finance/Housekeeping : état vide initial → `useEffect` de chargement → gestion d'erreur/chargement visible → plus aucune lecture/écriture `localStorage` pour les données métier (seules les préférences UI comme la devise restent en `localStorage`).
* Le Changelog (`04_DEVELOPMENT/Changelog.md`) est désormais tenu à jour à chaque livraison — ne pas laisser cette discipline retomber.

---

**Fin du document – 37_TECHNICAL_AUDIT.md**
