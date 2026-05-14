# 🚀 Hopela — Guide de déploiement et maintenance

## Informations du serveur

| Élément | Valeur |
|---|---|
| **VPS** | Hostinger KVM 2 |
| **IP** | 88.222.212.37 |
| **OS** | Ubuntu 24.04 LTS |
| **Domaine** | https://robot-nc.com |
| **Repo GitHub** | https://github.com/supportQC-NC/hopela-mvp |

---

## 1. Se connecter au VPS

Ouvre un terminal (Mac/Linux) ou PowerShell (Windows) et tape :

```bash
ssh root@88.222.212.37
```

Saisis le mot de passe root quand demandé.

---

## 2. Mettre à jour le site après un push GitHub

Après avoir fait un `git push` depuis ton ordinateur, connecte-toi au VPS et lance :

```bash
/var/www/hopela/update.sh
```

Ce script fait automatiquement :
1. `git pull` — récupère les dernières modifications
2. `npm install` — installe les nouvelles dépendances backend
3. `npm install && npm run build` — rebuild le frontend React
4. `pm2 restart` — redémarre le backend

⏱️ Durée : environ 3-5 minutes.

---

## 3. Réimporter les données (seeder)

⚠️ **Attention : efface toute la base de données et repart de zéro.**

```bash
cd /var/www/hopela/backend && node seeder.js
```

Pour supprimer toutes les données sans réimporter :

```bash
cd /var/www/hopela/backend && node seeder.js -d
```

---

## 4. Gérer le backend avec PM2

```bash
# Voir l'état du backend
pm2 status

# Voir les logs en temps réel
pm2 logs hopela-backend

# Redémarrer le backend
pm2 restart hopela-backend

# Arrêter le backend
pm2 stop hopela-backend

# Démarrer le backend
pm2 start hopela-backend
```

---

## 5. Gérer Nginx

```bash
# Vérifier la config Nginx
nginx -t

# Redémarrer Nginx
systemctl restart nginx

# Voir l'état de Nginx
systemctl status nginx
```

---

## 6. Gérer MongoDB

```bash
# Voir l'état de MongoDB
systemctl status mongod

# Redémarrer MongoDB
systemctl restart mongod

# Se connecter à la base de données
mongosh

# Dans mongosh — lister les bases
show dbs

# Utiliser la base Hopela
use hopela

# Compter les utilisateurs
db.users.countDocuments()

# Quitter
exit
```

---

## 7. Certificat SSL (renouvellement)

Le certificat SSL Let's Encrypt est renouvelé **automatiquement** tous les 90 jours par Certbot. Aucune action requise.

Pour vérifier la date d'expiration :

```bash
certbot certificates
```

---

## 8. Fichiers importants sur le serveur

| Fichier | Description |
|---|---|
| `/var/www/hopela/backend/.env` | Variables d'environnement backend |
| `/var/www/hopela/frontend/.env` | Variables d'environnement frontend |
| `/var/www/hopela/update.sh` | Script de mise à jour |
| `/etc/nginx/sites-available/hopela` | Config Nginx |
| `/etc/letsencrypt/live/robot-nc.com/` | Certificats SSL |
| `/root/.pm2/logs/` | Logs PM2 |

---

## 9. Modifier les variables d'environnement

**Backend** (SMTP, JWT, MongoDB...) :

```bash
nano /var/www/hopela/backend/.env
```

Après modification, redémarre le backend :

```bash
pm2 restart hopela-backend
```

**Frontend** (token Mapbox, URL API...) :

```bash
nano /var/www/hopela/frontend/.env
```

Après modification, rebuild le frontend :

```bash
cd /var/www/hopela/frontend && npm run build
```

---

## 10. En cas de problème

### Le site ne répond plus
```bash
pm2 status
systemctl status nginx
```

### Erreur 502 Bad Gateway
Le backend est arrêté :
```bash
pm2 restart hopela-backend
pm2 logs hopela-backend
```

### Erreur MongoDB
```bash
systemctl restart mongod
systemctl status mongod
```

### Voir tous les logs
```bash
# Logs backend
pm2 logs hopela-backend --lines 50

# Logs Nginx
tail -50 /var/log/nginx/error.log

# Logs MongoDB
tail -50 /var/log/mongodb/mongod.log
```

---

## 11. Workflow de développement

```
1. Modifier le code en local
2. Tester en local (npm run dev)
3. git add . && git commit -m "description"
4. git push origin main
5. SSH sur le VPS
6. /var/www/hopela/update.sh
7. Vérifier sur https://robot-nc.com
```

---

*Documentation Hopela MVP — Mai 2026*
