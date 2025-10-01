#!/bin/bash

# Script de diagnostic pour les problèmes de token Gitea
# Teste différentes configurations et URLs

set -e

GITEA_URL="https://gitea.com"
USERNAME="christophe.ganou"
TOKEN="ab6754252e54e0e1be57d514c9f4f81c15252b9c"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[DEBUG]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Test 1: Vérifier la connectivité de base
test_connectivity() {
    log "Test 1: Connectivité de base vers $GITEA_URL"
    
    local response
    response=$(curl -s -w "%{http_code}" -o /dev/null "$GITEA_URL" 2>/dev/null || echo "000")
    
    if [[ "$response" == "200" ]]; then
        success "Site accessible"
    else
        error "Site inaccessible (code: $response)"
    fi
}

# Test 2: Vérifier l'API sans authentification
test_api_basic() {
    log "Test 2: API de base (sans auth)"
    
    local response
    response=$(curl -s -w "\n%{http_code}" "$GITEA_URL/api/v1/version" 2>/dev/null || echo -e "\n000")
    
    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | head -n -1)
    
    if [[ "$http_code" == "200" ]]; then
        success "API accessible"
        log "Version: $(echo "$body" | grep -o '"version":"[^"]*"' | cut -d'"' -f4)"
    else
        error "API inaccessible (code: $http_code)"
    fi
}

# Test 3: Tester différents formats d'authentification
test_auth_formats() {
    log "Test 3: Formats d'authentification"
    
    # Format 1: Authorization: token
    log "  Format 1: Authorization: token"
    local response1
    response1=$(curl -s -w "%{http_code}" -o /dev/null \
        -H "Authorization: token $TOKEN" \
        "$GITEA_URL/api/v1/user" 2>/dev/null || echo "000")
    
    if [[ "$response1" == "200" ]]; then
        success "  Format 1 fonctionne"
        return 0
    else
        error "  Format 1 échoue (code: $response1)"
    fi
    
    # Format 2: Authorization: Bearer
    log "  Format 2: Authorization: Bearer"
    local response2
    response2=$(curl -s -w "%{http_code}" -o /dev/null \
        -H "Authorization: Bearer $TOKEN" \
        "$GITEA_URL/api/v1/user" 2>/dev/null || echo "000")
    
    if [[ "$response2" == "200" ]]; then
        success "  Format 2 fonctionne"
        return 0
    else
        error "  Format 2 échoue (code: $response2)"
    fi
    
    # Format 3: Query parameter
    log "  Format 3: Query parameter"
    local response3
    response3=$(curl -s -w "%{http_code}" -o /dev/null \
        "$GITEA_URL/api/v1/user?token=$TOKEN" 2>/dev/null || echo "000")
    
    if [[ "$response3" == "200" ]]; then
        success "  Format 3 fonctionne"
        return 0
    else
        error "  Format 3 échoue (code: $response3)"
    fi
}

# Test 4: Vérifier les permissions du token
test_token_permissions() {
    log "Test 4: Permissions du token"
    
    # Test lecture utilisateur
    local user_response
    user_response=$(curl -s -w "\n%{http_code}" \
        -H "Authorization: token $TOKEN" \
        "$GITEA_URL/api/v1/user" 2>/dev/null || echo -e "\n000")
    
    local user_code=$(echo "$user_response" | tail -n1)
    local user_body=$(echo "$user_response" | head -n -1)
    
    case $user_code in
        200)
            success "  Permission utilisateur: OK"
            local actual_user=$(echo "$user_body" | grep -o '"username":"[^"]*"' | cut -d'"' -f4)
            if [[ "$actual_user" == "$USERNAME" ]]; then
                success "  Nom d'utilisateur correspond: $actual_user"
            else
                warning "  Nom d'utilisateur différent: $actual_user (attendu: $USERNAME)"
            fi
            ;;
        401)
            error "  Permission utilisateur: Token invalide ou expiré"
            ;;
        403)
            error "  Permission utilisateur: Token sans permission 'user'"
            ;;
        *)
            error "  Permission utilisateur: Erreur $user_code"
            ;;
    esac
    
    # Test lecture repos
    local repos_response
    repos_response=$(curl -s -w "%{http_code}" -o /dev/null \
        -H "Authorization: token $TOKEN" \
        "$GITEA_URL/api/v1/user/repos?limit=1" 2>/dev/null || echo "000")
    
    case $repos_response in
        200)
            success "  Permission repos: OK"
            ;;
        401)
            error "  Permission repos: Token invalide"
            ;;
        403)
            error "  Permission repos: Token sans permission 'repo'"
            ;;
        *)
            error "  Permission repos: Erreur $repos_response"
            ;;
    esac
}

# Test 5: Vérifier si c'est un token d'application vs personnel
test_token_type() {
    log "Test 5: Type de token"
    
    local response
    response=$(curl -s -w "\n%{http_code}" \
        -H "Authorization: token $TOKEN" \
        "$GITEA_URL/api/v1/user/applications/oauth2" 2>/dev/null || echo -e "\n000")
    
    local code=$(echo "$response" | tail -n1)
    
    if [[ "$code" == "200" ]]; then
        log "  Token personnel détecté"
    elif [[ "$code" == "404" ]]; then
        log "  Endpoint OAuth2 non trouvé (normal pour token personnel)"
    else
        warning "  Type de token indéterminé (code: $code)"
    fi
}

# Test 6: Suggestions de résolution
suggest_fixes() {
    log "Suggestions de résolution:"
    
    echo -e "\n${YELLOW}1. Vérifiez que le token est correct:${NC}"
    echo "   - Connectez-vous sur $GITEA_URL"
    echo "   - Allez dans Paramètres > Applications > Tokens d'accès"
    echo "   - Vérifiez que le token existe et n'est pas expiré"
    
    echo -e "\n${YELLOW}2. Vérifiez les permissions du token:${NC}"
    echo "   - Permissions requises: repo, user, admin:org"
    echo "   - Recréez le token si nécessaire"
    
    echo -e "\n${YELLOW}3. Testez avec un nouveau token:${NC}"
    echo "   - Créez un nouveau token avec toutes les permissions"
    echo "   - Testez immédiatement après création"
    
    echo -e "\n${YELLOW}4. Vérifiez l'URL:${NC}"
    echo "   - URL actuelle: $GITEA_URL"
    echo "   - Essayez sans slash final"
    echo "   - Vérifiez si c'est une instance privée"
}

# Exécution des tests
main() {
    echo -e "${BLUE}=== Diagnostic Token Gitea ===${NC}"
    echo "URL: $GITEA_URL"
    echo "Utilisateur: $USERNAME"
    echo "Token: ${TOKEN:0:8}..."
    echo
    
    test_connectivity
    test_api_basic
    test_auth_formats
    test_token_permissions
    test_token_type
    suggest_fixes
}

main "$@"
