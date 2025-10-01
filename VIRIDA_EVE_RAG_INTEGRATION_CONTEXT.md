# 🌱 Intégration RAG EVE - Contexte Complet

## 📋 Résumé du Projet

Intégration réussie d'un système RAG (Retrieval Augmented Generation) pour le chatbot EVE de Virida, spécialisé dans la culture de tomates cerises en serre intelligente.

## 🏗️ Architecture Mise en Place

```
Frontend Virida (Clever Cloud)
    ↓ Utilisateur pose une question
https://app-4fdbaf24-6225-4bc5-a2bb-84319ea72bfb.cleverapps.io
    ↓ Chatbot EVE avec authentification
API Virida Backend (Clever Cloud)
    ↓ Endpoint /api/eve/chat-n8n
https://app-ff40e2dd-3bab-4a9b-82c4-8aa517a9a3f6.cleverapps.io
    ↓ Appel RAG_API_URL pour questions complexes
Système RAG EVE (Local - WSL)
    ↓ Docker containers sur localhost:8000
http://192.168.0.40:8000 (IP Windows locale)
    ↓ Mistral 7B + Embeddings + Base vectorielle
Réponse enrichie avec IA
```

## ✅ Ce qui fonctionne

### 1. Système RAG Local (100% opérationnel)
- **Localisation** : `/home/lekrikri/Projects/Virida/backend/virida-eve`
- **Branche** : `feat-EVE_003/rag-optimization`
- **URL locale** : `http://localhost:8000` ou `http://192.168.0.40:8000`
- **Services Docker** :
  - `virida_app` - API RAG optimisée (port 8000)
  - `virida_pgvector` - Base PostgreSQL + pgvector (port 5432)
  - `virida_redis` - Cache Redis (port 6379)
  - `virida_ollama` - LLM Mistral 7B (port 11434)

### 2. Base de Connaissances
- **40 chunks** d'informations sur les tomates cerises
- **Embeddings** avec SentenceTransformers all-MiniLM-L6-v2
- **Recherche vectorielle** avec pgvector
- **Documents** : culture, récolte, nutrition, diagnostic

### 3. API Optimisée
- **Cache Redis** : 5 minutes TTL
- **Streaming responses** : Server-Sent Events
- **Pool de connexions** : PostgreSQL optimisé
- **Fallback system** : Réponses rapides si RAG indisponible
- **Endpoints disponibles** :
  - `GET /health` - Status du système
  - `POST /ask` - Chat avec streaming
  - `POST /ask-sync` - Chat synchrone
  - `POST /search` - Recherche dans la base

### 4. Système Hybride API Virida
- **Réponses rapides** : Pour questions simples (température, humidité, etc.)
- **RAG avancé** : Pour questions complexes (>100 chars, mots-clés spécialisés)
- **Fallback intelligent** : Si RAG indisponible, utilise réponses rapides
- **Cache** : 5 minutes pour éviter appels répétés

## 🔧 Configuration Actuelle

### Variables d'Environnement Clever Cloud
```
DATABASE_URL=postgresql://u4k3kzbdibgk6repd9dv:qSFriZc6OeUgZ5027zCfJQyYc93fJs@bdtynchsknsci9ech8fi-postgresql.services.clever-cloud.com:50013/bdtynchsknsci9ech8fi

FRONTEND_URL=https://app-4fdbaf24-6225-4bc5-a2bb-84319ea72bfb.cleverapps.io

JWT_SECRET=your-super-secret-jwt-key-2024
JWT_REFRESH_SECRET=your-super-secret-refresh-key-2024

RAG_API_URL=http://192.168.0.40:8000  # ⚠️ IP locale - voir problème ci-dessous

REDIS_ENABLED=false
```

### Credentials de Test
- **Email** : `demo@virida.com`
- **Password** : `demo123`
- **Alternatif** : `test@virida.com` / `password123`

## ⚠️ Problème Actuel à Résoudre

### Symptôme
Le chatbot EVE donne uniquement des réponses rapides hardcodées, le système RAG n'est pas utilisé.

### Cause
L'API Clever Cloud ne peut pas accéder à l'IP locale `192.168.0.40:8000` depuis l'extérieur. Cette IP est privée et inaccessible depuis Internet.

### Solutions Possibles

#### Option 1 : Ngrok (Test rapide)
```bash
# Dans WSL
cd ~
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
tar xvzf ngrok-v3-stable-linux-amd64.tgz
sudo mv ngrok /usr/local/bin/

# Lancer le tunnel
ngrok http 8000

# Récupérer l'URL publique (ex: https://abc123.ngrok.io)
# Mettre à jour RAG_API_URL sur Clever Cloud
# Redéployer l'API
```

#### Option 2 : Déployer RAG sur Clever Cloud (Recommandée)
1. Créer une nouvelle app Clever Cloud pour le RAG
2. Configurer PostgreSQL addon avec pgvector
3. Adapter docker-compose pour Clever Cloud
4. Utiliser l'URL Clever Cloud dans RAG_API_URL

## 📁 Fichiers Clés Modifiés

### `/home/lekrikri/Projects/Virida/backend/virida-eve/eve/optimized_rag_api.py`
- API RAG optimisée avec cache Redis
- Endpoints pour chat et recherche
- Gestion d'erreurs et fallbacks
- Support streaming et synchrone

### `/home/lekrikri/Projects/Virida/backend/virida-eve/docker/docker-compose.yml`
```yaml
services:
  postgres:
    image: ankane/pgvector:latest
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: virida123
      POSTGRES_DB: virida
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"

  app:
    build:
      context: ..
      dockerfile: docker/Dockerfile
    ports:
      - "8000:8000"
    depends_on:
      - postgres
      - redis
      - ollama
    command: ["python", "-m", "uvicorn", "optimized_rag_api:app", "--host", "0.0.0.0", "--port", "8000"]
```

### `/home/lekrikri/Projects/Virida/backend/virida_api/src/routes/eve.js`
- Système hybride : réponses rapides + RAG
- Configuration `RAG_API_URL` et `RAG_TIMEOUT`
- Cache pour éviter appels répétés
- Endpoint `/api/eve/chat-n8n` pour intégration frontend
- Logique intelligente pour déterminer quand utiliser RAG

## 🧪 Tests Effectués

### Tests Locaux (✅ Fonctionnent)
```bash
# Health check
curl http://localhost:8000/health

# Chat synchrone
curl -X POST "http://localhost:8000/ask-sync" \
  -H "Content-Type: application/json" \
  -d '{"question": "Quelle température pour les tomates cerises?", "user_id": "test"}'

# Avec IP Windows
curl http://192.168.0.40:8000/health
```

### Tests Clever Cloud (⚠️ Authentification requise)
```bash
# API santé
curl https://app-ff40e2dd-3bab-4a9b-82c4-8aa517a9a3f6.cleverapps.io/health

# Chat EVE (nécessite token)
curl -X POST "https://app-ff40e2dd-3bab-4a9b-82c4-8aa517a9a3f6.cleverapps.io/api/eve/chat-n8n" \
  -H "Content-Type: application/json" \
  -d '{"message": "test", "userId": "demo"}'
```

## 🚀 Prochaines Étapes

### Immédiat (pour finaliser l'intégration)
1. **Installer ngrok** pour exposer le RAG publiquement
2. **Mettre à jour RAG_API_URL** avec l'URL ngrok
3. **Redéployer** l'API Virida
4. **Tester** l'intégration complète

### À long terme (pour la production)
1. **Déployer le RAG sur Clever Cloud** comme app séparée
2. **Configurer PostgreSQL addon** avec pgvector
3. **Optimiser les performances** pour la production
4. **Monitorer** les coûts et performances

## 📊 Performances Mesurées

- **Réponse rapide** : ~15ms
- **RAG complet** : ~58 secondes (Mistral 7B)
- **RAG optimisé** : ~10-20 secondes (avec cache)
- **Embeddings** : 40 chunks de connaissances
- **Cache hit** : <1 seconde

## 🔍 Diagnostics Utiles

### Vérifier si Docker tourne
```bash
cd /home/lekrikri/Projects/Virida/backend/virida-eve/docker
docker-compose ps
```

### Redémarrer le système RAG
```bash
docker-compose restart app
```

### Voir les logs
```bash
docker-compose logs app -f
```

### Tester la connectivité
```bash
curl http://localhost:8000/health
curl http://192.168.0.40:8000/health
```

## 🌐 URLs Importantes

- **Frontend Virida** : https://app-4fdbaf24-6225-4bc5-a2bb-84319ea72bfb.cleverapps.io
- **API Virida** : https://app-ff40e2dd-3bab-4a9b-82c4-8aa517a9a3f6.cleverapps.io
- **RAG Local** : http://localhost:8000 ou http://192.168.0.40:8000
- **IP Publique** : 91.173.103.215 (non accessible sur port 8000)

## 📝 Notes Importantes

- **Système complet et fonctionnel** localement
- **Intégration backend** prête sur Clever Cloud
- **Seul problème** : connectivité réseau entre Clever Cloud et local
- **Solution ngrok** permet test immédiat
- **Déploiement Clever Cloud** recommandé pour production

---

**Dernière mise à jour** : 28 septembre 2025, 19h40
**Status** : Prêt pour finalisation avec ngrok ou déploiement Clever Cloud