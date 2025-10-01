#!/bin/bash

# =============================================================================
# Script d'export Gitea via API - Version corrigée
# Résout les problèmes d'authentification et de token
# =============================================================================

set -e

# Configuration par défaut
DEFAULT_GITEA_URL="https://gitea.com"
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

# Configuration interactive
configure_api() {
    log "Configuration de l'API Gitea..."
    
    echo -e "\n${YELLOW}=== Configuration API Gitea ===${NC}"
    
    # URL Gitea
    echo -n "URL Gitea (défaut: $DEFAULT_GITEA_URL): "
    read -r input_url
    GITEA_URL="${input_url:-$DEFAULT_GITEA_URL}"
    
    # Supprimer les slashes finaux
    GITEA_URL="${GITEA_URL%/}"
    
    # Username
    echo -n "Nom d'utilisateur Gitea: "
    read -r USERNAME
    
    if [[ -z "$USERNAME" ]]; then
        error "Le nom d'utilisateur est requis"
    fi
    
    # Token
    echo -n "Token d'accès personnel: "
    read -rs TOKEN
    echo
    
    if [[ -z "$TOKEN" ]]; then
        error "Le token est requis"
    fi
    
    success "Configuration terminée"
    log "URL: $GITEA_URL"
    log "Utilisateur: $USERNAME"
}

# Test de connexion API
test_api_connection() {
    log "Test de connexion à l'API..."
    
    local response
    local http_code
    
    response=$(curl -s -w "\n%{http_code}" \
        -H "Authorization: token $TOKEN" \
        -H "Accept: application/json" \
        "$GITEA_URL/api/v1/user" 2>/dev/null || echo -e "\n000")
    
    http_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | head -n -1)
    
    case $http_code in
        200)
            success "Connexion API réussie"
            local user_name=$(echo "$response_body" | grep -o '"username":"[^"]*"' | cut -d'"' -f4)
            log "Connecté en tant que: $user_name"
            return 0
            ;;
        401)
            error "Authentification échouée. Vérifiez votre token."
            ;;
        404)
            error "URL API non trouvée. Vérifiez l'URL: $GITEA_URL"
            ;;
        000)
            error "Impossible de se connecter à $GITEA_URL"
            ;;
        *)
            error "Erreur API (code $http_code): $response_body"
            ;;
    esac
}

# Export des repositories
export_repositories() {
    log "Export des dépôts..."
    
    mkdir -p "$EXPORT_DIR/repositories"
    
    local repos_response
    repos_response=$(curl -s \
        -H "Authorization: token $TOKEN" \
        -H "Accept: application/json" \
        "$GITEA_URL/api/v1/user/repos?limit=100" 2>/dev/null)
    
    if [[ -z "$repos_response" ]] || [[ "$repos_response" == "null" ]]; then
        warning "Aucun dépôt trouvé ou erreur lors de la récupération"
        return
    fi
    
    echo "$repos_response" > "$EXPORT_DIR/repositories/repos_list.json"
    
    # Compter les repos
    local repo_count
    repo_count=$(echo "$repos_response" | grep -o '"name":' | wc -l)
    success "Exporté $repo_count dépôts"
}

# Export des organisations
export_organizations() {
    log "Export des organisations..."
    
    mkdir -p "$EXPORT_DIR/organizations"
    
    local orgs_response
    orgs_response=$(curl -s \
        -H "Authorization: token $TOKEN" \
        -H "Accept: application/json" \
        "$GITEA_URL/api/v1/user/orgs" 2>/dev/null)
    
    if [[ -n "$orgs_response" ]] && [[ "$orgs_response" != "null" ]]; then
        echo "$orgs_response" > "$EXPORT_DIR/organizations/orgs_list.json"
        local org_count
        org_count=$(echo "$orgs_response" | grep -o '"username":' | wc -l)
        success "Exporté $org_count organisations"
    else
        warning "Aucune organisation trouvée"
    fi
}

# Export des issues
export_issues() {
    log "Export des issues..."
    
    mkdir -p "$EXPORT_DIR/issues"
    
    # Récupérer les repos pour extraire les issues
    local repos_response
    repos_response=$(cat "$EXPORT_DIR/repositories/repos_list.json" 2>/dev/null || echo "[]")
    
    if [[ "$repos_response" == "[]" ]]; then
        warning "Pas de dépôts pour extraire les issues"
        return
    fi
    
    # Extraire les noms de repos (méthode compatible)
    local repo_names
    repo_names=$(echo "$repos_response" | grep -o '"full_name":"[^"]*"' | cut -d'"' -f4)
    
    local total_issues=0
    
    while IFS= read -r repo_name; do
        if [[ -n "$repo_name" ]]; then
            local issues_response
            issues_response=$(curl -s \
                -H "Authorization: token $TOKEN" \
                -H "Accept: application/json" \
                "$GITEA_URL/api/v1/repos/$repo_name/issues?state=all&limit=100" 2>/dev/null)
            
            if [[ -n "$issues_response" ]] && [[ "$issues_response" != "null" ]] && [[ "$issues_response" != "[]" ]]; then
                local safe_name
                safe_name=$(echo "$repo_name" | tr '/' '_')
                echo "$issues_response" > "$EXPORT_DIR/issues/${safe_name}_issues.json"
                local issue_count
                issue_count=$(echo "$issues_response" | grep -o '"number":' | wc -l)
                total_issues=$((total_issues + issue_count))
                log "  $repo_name: $issue_count issues"
            fi
        fi
    done <<< "$repo_names"
    
    success "Exporté $total_issues issues au total"
}

# Créer l'archive
create_archive() {
    log "Création de l'archive..."
    
    if [[ ! -d "$EXPORT_DIR" ]]; then
        error "Répertoire d'export non trouvé: $EXPORT_DIR"
    fi
    
    cd "$SCRIPT_DIR"
    tar -czf "$ARCHIVE_NAME" -C "$SCRIPT_DIR" "$(basename "$EXPORT_DIR")"
    
    if [[ -f "$ARCHIVE_NAME" ]]; then
        local archive_size
        archive_size=$(du -h "$ARCHIVE_NAME" | cut -f1)
        success "Archive créée: $ARCHIVE_NAME ($archive_size)"
        
        # Nettoyer le répertoire temporaire
        rm -rf "$EXPORT_DIR"
        success "Répertoire temporaire nettoyé"
    else
        error "Échec de création de l'archive"
    fi
}

# Fonction principale
main() {
    log "Démarrage de l'export Gitea via API"
    
    configure_api
    test_api_connection
    
    log "Création du répertoire d'export: $EXPORT_DIR"
    rm -rf "$EXPORT_DIR"
    mkdir -p "$EXPORT_DIR"
    
    export_repositories
    export_organizations
    export_issues
    
    create_archive
    
    success "Export terminé avec succès!"
    log "Archive disponible: $ARCHIVE_NAME"
}

# Vérifier les prérequis
if ! command -v curl &> /dev/null; then
    error "curl n'est pas installé"
fi

if ! command -v tar &> /dev/null; then
    error "tar n'est pas installé"
fi

# Exécuter le script principal
main "$@"
