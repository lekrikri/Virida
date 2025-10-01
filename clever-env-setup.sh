#!/bin/bash

# Variables d'environnement essentielles pour Gitea sur Clever Cloud
# Basé sur la documentation officielle Clever Cloud

echo "🔧 Configuration des variables d'environnement..."

# PostgreSQL - Optimisation connexions
clever env set CC_PGPOOL_NUM_INIT_CHILDREN 5
clever env set CC_PGPOOL_MAX_POOL 1

# Gitea - Configuration de base
clever env set GITEA_WORK_DIR "/home/bas/app_data"
clever env set GITEA_CUSTOM "/home/bas/app_data/custom"
clever env set USER "git"

# Serveur - Configuration Clever Cloud
clever env set PORT 8080
clever env set CC_WEBROOT "/"

# Base de données - SSL et sécurité
clever env set PGSSLMODE "require"
clever env set PGCONNECT_TIMEOUT 10

# Git - Résolution du binaire manquant
clever env set GIT_EXEC_PATH "/usr/bin"
clever env set PATH "/usr/bin:/usr/local/bin:$PATH"

# Hooks de déploiement
clever env set CC_PRE_BUILD_HOOK "mkdir -p /home/bas/app_data/custom/conf /home/bas/app_data/gitea-repositories"
clever env set CC_POST_BUILD_HOOK "cp custom/conf/app.ini /home/bas/app_data/custom/conf/ || true"

echo "✅ Variables configurées. Redémarrage..."
clever restart --quiet

echo "📊 Vérification des logs..."
sleep 10
clever logs --lines 50
