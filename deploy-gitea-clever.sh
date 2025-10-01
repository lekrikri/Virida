#!/bin/bash

# Script de déploiement Gitea optimisé pour Clever Cloud
# Résout les problèmes de connexions PostgreSQL

echo "🚀 Configuration Gitea pour Clever Cloud..."

# 1. Configuration des variables d'environnement PostgreSQL
clever env set CC_PGPOOL_NUM_INIT_CHILDREN 5
clever env set CC_PGPOOL_MAX_POOL 1

# 2. Configuration Gitea
clever env set GITEA_WORK_DIR /home/bas/app_data
clever env set GITEA_CUSTOM /home/bas/app_data/custom
clever env set GITEA_SECRET_KEY $(openssl rand -base64 32)

# 3. Configuration du serveur
clever env set PORT 8080
clever env set CC_WEBROOT "/"

# 4. Hooks de build
clever env set CC_PRE_BUILD_HOOK "mkdir -p /home/bas/app_data/custom/conf"
clever env set CC_POST_BUILD_HOOK "cp gitea-clever-cloud-config.ini /home/bas/app_data/custom/conf/app.ini"

# 5. Configuration SSL pour PostgreSQL
clever env set PGSSLMODE require

# 6. Redémarrage de l'application
clever restart

echo "✅ Configuration terminée. Vérifiez les logs avec: clever logs"
