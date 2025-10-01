#!/bin/bash

# =============================================================================
# Script de sauvegarde Gitea pour transfert vers Clever Cloud
# Auteur: Virida Team
# Date: $(date +%Y-%m-%d)
# =============================================================================

set -e  # Arrêter en cas d'erreur

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="$SCRIPT_DIR/virida-gitea-transfer"
DATE=$(date +%Y%m%d_%H%M%S)
ARCHIVE_NAME="virida-gitea-backup-$DATE.tar.gz"

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction de log
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Détecter l'installation Gitea
detect_gitea_path() {
    log "Détection de l'installation Gitea..."
    
    # Chemins possibles de Gitea
    POSSIBLE_PATHS=(
        "$HOME/.gitea"
        "/var/lib/gitea"
        "/opt/gitea"
        "/usr/local/gitea"
        "$HOME/gitea"
        "./gitea"
    )
    
    for path in "${POSSIBLE_PATHS[@]}"; do
        if [[ -d "$path/data" ]]; then
            GITEA_PATH="$path"
            success "Gitea trouvé dans: $GITEA_PATH"
            return 0
        fi
    done
    
    # Demander à l'utilisateur
    warning "Gitea non trouvé automatiquement"
    read -p "Entrez le chemin vers votre installation Gitea: " GITEA_PATH
    
    if [[ ! -d "$GITEA_PATH/data" ]]; then
        error "Chemin invalide: $GITEA_PATH/data n'existe pas"
    fi
}

# Créer le dossier de sauvegarde
create_backup_dir() {
    log "Création du dossier de sauvegarde..."
    
    if [[ -d "$BACKUP_DIR" ]]; then
        warning "Dossier existant, suppression..."
        rm -rf "$BACKUP_DIR"
    fi
    
    mkdir -p "$BACKUP_DIR"
    success "Dossier créé: $BACKUP_DIR"
}

# Sauvegarder la base de données
backup_database() {
    log "Sauvegarde de la base de données..."
    
    # SQLite (par défaut)
    if [[ -f "$GITEA_PATH/data/gitea.db" ]]; then
        cp "$GITEA_PATH/data/gitea.db" "$BACKUP_DIR/"
        success "Base SQLite sauvegardée"
        return 0
    fi
    
    # PostgreSQL
    if command -v pg_dump &> /dev/null; then
        read -p "Nom de la base PostgreSQL (défaut: gitea): " DB_NAME
        DB_NAME=${DB_NAME:-gitea}
        
        if pg_dump "$DB_NAME" > "$BACKUP_DIR/gitea-postgres.sql" 2>/dev/null; then
            success "Base PostgreSQL sauvegardée"
            return 0
        fi
    fi
    
    # MySQL
    if command -v mysqldump &> /dev/null; then
        read -p "Nom de la base MySQL (défaut: gitea): " DB_NAME
        DB_NAME=${DB_NAME:-gitea}
        
        if mysqldump "$DB_NAME" > "$BACKUP_DIR/gitea-mysql.sql" 2>/dev/null; then
            success "Base MySQL sauvegardée"
            return 0
        fi
    fi
    
    warning "Aucune base de données trouvée, continuons..."
}

# Sauvegarder les repositories
backup_repositories() {
    log "Sauvegarde des repositories..."
    
    if [[ -d "$GITEA_PATH/data/repositories" ]]; then
        cp -r "$GITEA_PATH/data/repositories" "$BACKUP_DIR/"
        
        # Compter les repos
        REPO_COUNT=$(find "$BACKUP_DIR/repositories" -name "*.git" -type d | wc -l)
        success "Repositories sauvegardés: $REPO_COUNT dépôts"
    else
        warning "Dossier repositories non trouvé"
    fi
}

# Sauvegarder la configuration
backup_config() {
    log "Sauvegarde de la configuration..."
    
    # app.ini principal
    if [[ -f "$GITEA_PATH/custom/conf/app.ini" ]]; then
        mkdir -p "$BACKUP_DIR/conf"
        cp "$GITEA_PATH/custom/conf/app.ini" "$BACKUP_DIR/conf/"
        success "Configuration app.ini sauvegardée"
    fi
    
    # Configuration alternative
    if [[ -f "$GITEA_PATH/conf/app.ini" ]]; then
        mkdir -p "$BACKUP_DIR/conf"
        cp "$GITEA_PATH/conf/app.ini" "$BACKUP_DIR/conf/"
        success "Configuration alternative sauvegardée"
    fi
}

# Sauvegarder les avatars et uploads
backup_uploads() {
    log "Sauvegarde des uploads et avatars..."
    
    # Avatars
    if [[ -d "$GITEA_PATH/data/avatars" ]]; then
        cp -r "$GITEA_PATH/data/avatars" "$BACKUP_DIR/"
        success "Avatars sauvegardés"
    fi
    
    # Uploads/attachments
    if [[ -d "$GITEA_PATH/data/attachments" ]]; then
        cp -r "$GITEA_PATH/data/attachments" "$BACKUP_DIR/"
        success "Attachments sauvegardés"
    fi
    
    # LFS (Large File Storage)
    if [[ -d "$GITEA_PATH/data/lfs" ]]; then
        cp -r "$GITEA_PATH/data/lfs" "$BACKUP_DIR/"
        success "LFS sauvegardé"
    fi
}

# Créer le fichier README pour le transfert
create_readme() {
    log "Création du README de transfert..."
    
    cat > "$BACKUP_DIR/README-TRANSFER.md" << EOF
# Sauvegarde Gitea Virida - $(date)

## Contenu de cette sauvegarde

### Base de données
- \`gitea.db\` : Base SQLite principale
- \`gitea-postgres.sql\` : Dump PostgreSQL (si applicable)
- \`gitea-mysql.sql\` : Dump MySQL (si applicable)

### Repositories
- \`repositories/\` : Tous les dépôts Git avec historique complet

### Configuration
- \`conf/app.ini\` : Configuration principale Gitea

### Assets
- \`avatars/\` : Images de profil utilisateurs
- \`attachments/\` : Fichiers attachés aux issues
- \`lfs/\` : Large File Storage (si utilisé)

## Instructions pour Clever Cloud

### 1. Créer addon base de données
\`\`\`bash
clever addon create postgresql-addon --name gitea-db --plan dev
\`\`\`

### 2. Variables d'environnement
\`\`\`bash
GITEA_DATABASE_TYPE=postgres
GITEA_DATABASE_HOST=<addon-host>
GITEA_DATABASE_NAME=gitea
GITEA_DATABASE_USER=<addon-user>
GITEA_DATABASE_PASSWORD=<addon-password>
\`\`\`

### 3. Restaurer les données
1. Uploader les repositories vers FS Bucket
2. Importer le dump SQL dans PostgreSQL
3. Configurer les chemins dans app.ini
4. Redémarrer l'application

## Informations système
- Date sauvegarde: $(date)
- Taille totale: $(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1 || echo "Calcul en cours...")
- Nombre de repositories: $(find "$BACKUP_DIR/repositories" -name "*.git" -type d 2>/dev/null | wc -l || echo "0")
- Version Gitea: $(gitea --version 2>/dev/null || echo "Non détectée")

## Contact
Pour toute question sur cette sauvegarde, contacter l'équipe Virida.
EOF

    success "README créé"
}

# Créer l'archive finale
create_archive() {
    log "Création de l'archive finale..."
    
    cd "$SCRIPT_DIR"
    tar -czf "$ARCHIVE_NAME" -C "$(dirname "$BACKUP_DIR")" "$(basename "$BACKUP_DIR")"
    
    # Calculer la taille
    ARCHIVE_SIZE=$(du -sh "$ARCHIVE_NAME" | cut -f1)
    success "Archive créée: $ARCHIVE_NAME ($ARCHIVE_SIZE)"
}

# Nettoyer les fichiers temporaires
cleanup() {
    log "Nettoyage des fichiers temporaires..."
    
    if [[ -d "$BACKUP_DIR" ]]; then
        rm -rf "$BACKUP_DIR"
        success "Dossier temporaire supprimé"
    fi
}

# Afficher le résumé
show_summary() {
    echo ""
    echo "=================================="
    echo "🎉 SAUVEGARDE TERMINÉE"
    echo "=================================="
    echo "📦 Archive: $ARCHIVE_NAME"
    echo "📊 Taille: $(du -sh "$ARCHIVE_NAME" | cut -f1)"
    echo "📍 Emplacement: $SCRIPT_DIR/$ARCHIVE_NAME"
    echo ""
    echo "📋 Instructions pour ton collègue:"
    echo "1. Télécharger l'archive: $ARCHIVE_NAME"
    echo "2. Extraire: tar -xzf $ARCHIVE_NAME"
    echo "3. Lire le README-TRANSFER.md"
    echo "4. Configurer l'addon Clever Cloud"
    echo ""
    echo "✅ Prêt pour le transfert vers Clever Cloud!"
}

# =============================================================================
# MAIN SCRIPT
# =============================================================================

main() {
    echo "🚀 Script de sauvegarde Gitea pour Virida"
    echo "=========================================="
    
    detect_gitea_path
    create_backup_dir
    backup_database
    backup_repositories
    backup_config
    backup_uploads
    create_readme
    create_archive
    cleanup
    show_summary
}

# Gestion des erreurs
trap 'error "Script interrompu"' INT TERM

# Exécution
main "$@"
