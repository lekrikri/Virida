#!/bin/bash

# =============================================================================
# Script d'export Gitea via API pour service hébergé (gitea.com)
# Auteur: Virida Team
# Date: $(date +%Y-%m-%d)
# =============================================================================

set -e

# Configuration
GITEA_URL="https://gitea.com"
USERNAME="ton-username"  # À modifier
TOKEN=""  # Token d'accès personnel à générer
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXPORT_DIR="$SCRIPT_DIR/virida-gitea-export"
DATE=$(date +%Y%m%d_%H%M%S)
ARCHIVE_NAME="virida-gitea-export-$DATE.tar.gz"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Vérifier les prérequis
check_prerequisites() {
    log "Vérification des prérequis..."
    
    if ! command -v curl &> /dev/null; then
        error "curl n'est pas installé"
    fi
    
    if ! command -v jq &> /dev/null; then
        warning "jq n'est pas installé, installation..."
        sudo apt update && sudo apt install -y jq
    fi
    
    success "Prérequis OK"
}

# Configuration interactive
setup_config() {
    log "Configuration de l'export..."
    
    echo "🔧 Configuration de l'export Gitea"
    echo "=================================="
    
    # URL Gitea
    read -p "URL de votre Gitea (défaut: https://gitea.com): " input_url
    GITEA_URL=${input_url:-$GITEA_URL}
    
    # Username
    read -p "Votre nom d'utilisateur Gitea: " input_username
    if [[ -z "$input_username" ]]; then
        error "Le nom d'utilisateur est obligatoire"
    fi
    USERNAME="$input_username"
    
    # Token
    echo ""
    echo "🔑 Vous devez créer un token d'accès personnel:"
    echo "1. Allez dans: $GITEA_URL/user/settings/applications"
    echo "2. Cliquez 'Generate New Token'"
    echo "3. Sélectionnez les permissions: repo, user, admin:org"
    echo "4. Copiez le token généré"
    echo ""
    read -s -p "Collez votre token d'accès: " input_token
    echo ""
    
    if [[ -z "$input_token" ]]; then
        error "Le token est obligatoire"
    fi
    TOKEN="$input_token"
    
    success "Configuration terminée"
}

# Tester la connexion API
test_api_connection() {
    log "Test de la connexion API..."
    
    response=$(curl -s -H "Authorization: token $TOKEN" "$GITEA_URL/api/v1/user")
    
    if echo "$response" | jq -e '.login' > /dev/null 2>&1; then
        user_login=$(echo "$response" | jq -r '.login')
        success "Connexion réussie pour: $user_login"
    else
        error "Échec de la connexion API. Vérifiez votre token."
    fi
}

# Créer le dossier d'export
create_export_dir() {
    log "Création du dossier d'export..."
    
    if [[ -d "$EXPORT_DIR" ]]; then
        rm -rf "$EXPORT_DIR"
    fi
    
    mkdir -p "$EXPORT_DIR"/{repositories,issues,organizations,metadata}
    success "Dossier créé: $EXPORT_DIR"
}

# Exporter les repositories
export_repositories() {
    log "Export des repositories..."
    
    # Lister les repos de l'utilisateur
    repos=$(curl -s -H "Authorization: token $TOKEN" "$GITEA_URL/api/v1/user/repos?limit=100")
    
    if ! echo "$repos" | jq -e '.[0]' > /dev/null 2>&1; then
        warning "Aucun repository trouvé"
        return
    fi
    
    echo "$repos" | jq -c '.[]' | while read -r repo; do
        repo_name=$(echo "$repo" | jq -r '.name')
        repo_full_name=$(echo "$repo" | jq -r '.full_name')
        clone_url=$(echo "$repo" | jq -r '.clone_url')
        
        log "Clonage de $repo_name..."
        
        # Cloner le repo
        git clone "$clone_url" "$EXPORT_DIR/repositories/$repo_name" 2>/dev/null || {
            warning "Échec du clone de $repo_name"
            continue
        }
        
        # Sauvegarder les métadonnées
        echo "$repo" | jq '.' > "$EXPORT_DIR/metadata/$repo_name.json"
        
        success "Repository $repo_name exporté"
    done
    
    repo_count=$(find "$EXPORT_DIR/repositories" -maxdepth 1 -type d | wc -l)
    success "Repositories exportés: $((repo_count - 1))"
}

# Exporter les issues
export_issues() {
    log "Export des issues..."
    
    repos=$(curl -s -H "Authorization: token $TOKEN" "$GITEA_URL/api/v1/user/repos?limit=100")
    
    echo "$repos" | jq -c '.[]' | while read -r repo; do
        repo_name=$(echo "$repo" | jq -r '.name')
        repo_full_name=$(echo "$repo" | jq -r '.full_name')
        
        # Récupérer les issues
        issues=$(curl -s -H "Authorization: token $TOKEN" "$GITEA_URL/api/v1/repos/$repo_full_name/issues?state=all&limit=100")
        
        if echo "$issues" | jq -e '.[0]' > /dev/null 2>&1; then
            echo "$issues" | jq '.' > "$EXPORT_DIR/issues/$repo_name-issues.json"
            issue_count=$(echo "$issues" | jq '. | length')
            log "Issues exportées pour $repo_name: $issue_count"
        fi
    done
    
    success "Export des issues terminé"
}

# Exporter les organisations
export_organizations() {
    log "Export des organisations..."
    
    orgs=$(curl -s -H "Authorization: token $TOKEN" "$GITEA_URL/api/v1/user/orgs")
    
    if echo "$orgs" | jq -e '.[0]' > /dev/null 2>&1; then
        echo "$orgs" | jq '.' > "$EXPORT_DIR/organizations/organizations.json"
        org_count=$(echo "$orgs" | jq '. | length')
        success "Organisations exportées: $org_count"
    else
        warning "Aucune organisation trouvée"
    fi
}

# Créer le README d'export
create_export_readme() {
    log "Création du README d'export..."
    
    cat > "$EXPORT_DIR/README-EXPORT.md" << EOF
# Export Gitea Virida - $(date)

## Contenu de cet export

### Repositories
- \`repositories/\` : Tous les dépôts Git clonés avec historique complet
- \`metadata/\` : Métadonnées JSON de chaque repository

### Issues
- \`issues/\` : Toutes les issues exportées par repository (format JSON)

### Organizations
- \`organizations/\` : Informations sur les organisations (format JSON)

## Statistiques
- Date export: $(date)
- Utilisateur: $USERNAME
- URL Gitea: $GITEA_URL
- Repositories: $(find "$EXPORT_DIR/repositories" -maxdepth 1 -type d | wc -l) dépôts
- Issues: $(find "$EXPORT_DIR/issues" -name "*.json" | wc -l) fichiers

## Instructions pour ton collègue

### 1. Restaurer les repositories
\`\`\`bash
# Pour chaque repo dans repositories/
cd repositories/repo-name
git remote set-url origin <nouvelle-url-clever-cloud>
git push --all origin
git push --tags origin
\`\`\`

### 2. Importer les issues
Les issues sont en format JSON et peuvent être importées via:
- API Gitea du nouveau serveur
- Scripts d'import personnalisés
- Interface web (manuellement)

### 3. Recréer les organisations
Utiliser les données dans \`organizations/\` pour recréer la structure.

## Notes importantes
- Les permissions utilisateurs ne sont pas exportées
- Les webhooks doivent être reconfigurés
- Les tokens d'accès doivent être régénérés
- Les clés SSH doivent être réajoutées

## Contact
Pour toute question, contacter l'équipe Virida.
EOF

    success "README créé"
}

# Créer l'archive finale
create_final_archive() {
    log "Création de l'archive finale..."
    
    cd "$SCRIPT_DIR"
    tar -czf "$ARCHIVE_NAME" -C "$(dirname "$EXPORT_DIR")" "$(basename "$EXPORT_DIR")"
    
    archive_size=$(du -sh "$ARCHIVE_NAME" | cut -f1)
    success "Archive créée: $ARCHIVE_NAME ($archive_size)"
}

# Nettoyer
cleanup() {
    log "Nettoyage..."
    
    if [[ -d "$EXPORT_DIR" ]]; then
        rm -rf "$EXPORT_DIR"
        success "Dossier temporaire supprimé"
    fi
}

# Résumé final
show_final_summary() {
    echo ""
    echo "=================================="
    echo "🎉 EXPORT TERMINÉ"
    echo "=================================="
    echo "📦 Archive: $ARCHIVE_NAME"
    echo "📊 Taille: $(du -sh "$ARCHIVE_NAME" | cut -f1)"
    echo "📍 Emplacement: $SCRIPT_DIR/$ARCHIVE_NAME"
    echo ""
    echo "📋 Contenu exporté:"
    echo "- ✅ Repositories avec historique Git complet"
    echo "- ✅ Issues et métadonnées"
    echo "- ✅ Informations organisations"
    echo "- ✅ README avec instructions"
    echo ""
    echo "🚀 Prêt à envoyer à ton collègue!"
}

# =============================================================================
# MAIN SCRIPT
# =============================================================================

main() {
    echo "🚀 Export Gitea via API pour Virida"
    echo "===================================="
    
    check_prerequisites
    setup_config
    test_api_connection
    create_export_dir
    export_repositories
    export_issues
    export_organizations
    create_export_readme
    create_final_archive
    cleanup
    show_final_summary
}

# Gestion des erreurs
trap 'error "Script interrompu"' INT TERM

# Exécution
main "$@"
