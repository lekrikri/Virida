#!/bin/bash

# Déploiement complet Gitea sur Clever Cloud
# Résout les problèmes PostgreSQL et de configuration

set -e

# Configuration
APP_NAME="virida-gitea"
APP_TYPE="docker"
REGION="par"  # Paris

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}[DEPLOY]${NC} $1"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; exit 1; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }

echo -e "${BLUE}=== Déploiement Gitea sur Clever Cloud ===${NC}"

# Étape 1: Créer l'application
log "Étape 1: Création de l'application Gitea"
if clever create --type $APP_TYPE --name $APP_NAME --region $REGION --alias $APP_NAME; then
    success "Application créée: $APP_NAME"
else
    error "Échec de création de l'application"
fi

# Étape 2: Créer l'addon PostgreSQL
log "Étape 2: Création de l'addon PostgreSQL"
if clever addon create postgresql-addon --name "${APP_NAME}-db" --plan dev; then
    success "Addon PostgreSQL créé"
else
    warning "Addon PostgreSQL existe peut-être déjà"
fi

# Étape 3: Lier l'addon à l'application
log "Étape 3: Liaison de l'addon PostgreSQL"
clever addon link "${APP_NAME}-db" --alias $APP_NAME

# Étape 4: Configuration des variables d'environnement optimisées
log "Étape 4: Configuration des variables d'environnement"

# PostgreSQL - Optimisation connexions (basé sur documentation Clever Cloud)
clever env set CC_PGPOOL_NUM_INIT_CHILDREN 5 --alias $APP_NAME
clever env set CC_PGPOOL_MAX_POOL 1 --alias $APP_NAME

# Gitea - Configuration de base
clever env set GITEA_WORK_DIR "/home/bas/app_data" --alias $APP_NAME
clever env set GITEA_CUSTOM "/home/bas/app_data/custom" --alias $APP_NAME
clever env set USER "git" --alias $APP_NAME

# Serveur - Configuration Clever Cloud
clever env set PORT 8080 --alias $APP_NAME
clever env set CC_WEBROOT "/" --alias $APP_NAME

# Base de données - SSL et sécurité
clever env set PGSSLMODE "require" --alias $APP_NAME
clever env set PGCONNECT_TIMEOUT 10 --alias $APP_NAME

# Git - Résolution du binaire manquant
clever env set GIT_EXEC_PATH "/usr/bin" --alias $APP_NAME
clever env set PATH "/usr/bin:/usr/local/bin:\$PATH" --alias $APP_NAME

# Gitea - Secrets et sécurité
GITEA_SECRET=$(openssl rand -base64 32)
clever env set GITEA_SECRET_KEY "$GITEA_SECRET" --alias $APP_NAME

# Hooks de déploiement
clever env set CC_PRE_BUILD_HOOK "mkdir -p /home/bas/app_data/custom/conf /home/bas/app_data/gitea-repositories" --alias $APP_NAME
clever env set CC_POST_BUILD_HOOK "cp custom/conf/app.ini /home/bas/app_data/custom/conf/ || true" --alias $APP_NAME

success "Variables d'environnement configurées"

# Étape 5: Créer le Dockerfile optimisé
log "Étape 5: Création du Dockerfile"
cat > Dockerfile << 'EOF'
FROM gitea/gitea:1.25

# Installation des dépendances manquantes
USER root
RUN apk add --no-cache git curl bash

# Configuration des répertoires
RUN mkdir -p /home/bas/app_data/custom/conf /home/bas/app_data/gitea-repositories
RUN chown -R git:git /home/bas/app_data

# Copie de la configuration
COPY gitea-clever-cloud-config.ini /home/bas/app_data/custom/conf/app.ini

# Retour à l'utilisateur git
USER git

# Port d'écoute
EXPOSE 8080

# Point d'entrée
ENTRYPOINT ["/usr/bin/entrypoint"]
CMD ["/usr/local/bin/gitea", "web"]
EOF

success "Dockerfile créé"

# Étape 6: Déployer l'application
log "Étape 6: Déploiement de l'application"
if clever deploy --alias $APP_NAME; then
    success "Déploiement lancé"
else
    error "Échec du déploiement"
fi

# Étape 7: Afficher les informations de déploiement
log "Étape 7: Informations de déploiement"
clever status --alias $APP_NAME
clever domain --alias $APP_NAME

echo
success "Déploiement Gitea terminé!"
echo
log "Prochaines étapes:"
echo "1. Attendez que le déploiement soit terminé"
echo "2. Vérifiez les logs: clever logs --alias $APP_NAME"
echo "3. Accédez à votre application via l'URL affichée"
echo "4. Configurez Gitea lors du premier accès"
echo
warning "Si des erreurs PostgreSQL persistent:"
echo "- Vérifiez les logs: clever logs --alias $APP_NAME"
echo "- Ajustez CC_PGPOOL_NUM_INIT_CHILDREN si nécessaire"
echo "- Contactez le support Clever Cloud pour l'upgrade du plan PostgreSQL"
