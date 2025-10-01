#!/bin/bash

# Test avancé du nouveau token Gitea
# Diagnostic de l'erreur "user does not exist"

NEW_TOKEN="5c55901e40baa1b4d9b1061b6a4c0db8a2c58"
GITEA_URL="https://gitea.com"
USERNAME="christophe.ganou"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}[TEST]${NC} $1"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }

echo -e "${BLUE}=== Test du Nouveau Token ===${NC}"
echo "Token: ${NEW_TOKEN:0:8}..."
echo "URL: $GITEA_URL"
echo

# Test 1: Vérifier la réponse complète de l'API user
log "Test 1: Réponse API complète"
response=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: token $NEW_TOKEN" \
    -H "Accept: application/json" \
    "$GITEA_URL/api/v1/user" 2>/dev/null)

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n -1)

echo "Code HTTP: $http_code"
echo "Réponse: $body"
echo

# Test 2: Essayer avec différentes approches
log "Test 2: Méthodes alternatives"

# Test avec /user/repos
log "  Test /user/repos"
repos_response=$(curl -s -w "%{http_code}" -o /dev/null \
    -H "Authorization: token $NEW_TOKEN" \
    "$GITEA_URL/api/v1/user/repos" 2>/dev/null)
echo "  Code repos: $repos_response"

# Test avec /users/{username}
log "  Test /users/$USERNAME"
user_response=$(curl -s -w "%{http_code}" -o /dev/null \
    -H "Authorization: token $NEW_TOKEN" \
    "$GITEA_URL/api/v1/users/$USERNAME" 2>/dev/null)
echo "  Code user public: $user_response"

# Test 3: Vérifier les headers
log "Test 3: Headers de réponse"
headers=$(curl -s -I \
    -H "Authorization: token $NEW_TOKEN" \
    "$GITEA_URL/api/v1/user" 2>/dev/null)
echo "$headers"

echo
log "Solutions possibles:"
echo "1. Le token n'a pas la permission 'user:read'"
echo "2. Le token a été créé mais pas activé"
echo "3. Problème de cache côté Gitea"
echo "4. Token créé pour une organisation au lieu d'un utilisateur"
echo
echo "Actions recommandées:"
echo "- Supprimez le token actuel sur gitea.com"
echo "- Créez un nouveau token avec TOUTES les permissions cochées"
echo "- Testez immédiatement après création"
