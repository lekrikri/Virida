# Contexte Complet Virida pour Claude AI

## Vue d'ensemble du projet

**Virida** est une application de gestion de serre intelligente composée d'un backend Node.js/Express et d'un frontend React/TypeScript, tous deux déployés sur Clever Cloud.

## Architecture actuelle

### Backend (virida_api)
- **Framework**: Node.js + Express.js
- **Base de données**: PostgreSQL (Prisma ORM)
- **Cache**: Redis (actuellement désactivé en production avec `REDIS_ENABLED=false`)
- **Time-series**: ClickHouse (fallback vers PostgreSQL en production)
- **Authentification**: JWT avec refresh tokens
- **WebSocket**: Pour les données temps réel
- **Déploiement**: Clever Cloud
- **URL**: https://app-ff40e2dd-3bab-4a9b-82c4-8aa517a9a3f6.cleverapps.io

### Frontend (virida_app)
- **Framework**: React + TypeScript + Vite
- **UI**: Tailwind CSS
- **État**: Context API + hooks personnalisés
- **Déploiement**: Clever Cloud
- **URL**: https://app-4fdbaf24-6225-4bc5-a2bb-84319ea72bfb.cleverapps.io

## État actuel du déploiement

### Backend ✅ FONCTIONNEL
- **Statut**: Déployé et opérationnel
- **Branche**: `master` (créée spécialement pour Clever Cloud)
- **Repository GitHub**: `Virida-ghouse/virida_api`
- **Clever Cloud alias**: `viridaapi`
- **Dernière modification**: Fix CORS et authentification complète fonctionnelle

#### Variables d'environnement configurées:
```
DATABASE_URL=<PostgreSQL URL from Clever Cloud>
JWT_SECRET=<secret key>
JWT_REFRESH_SECRET=<secret key>
REDIS_ENABLED=false
```

#### Services actifs:
- ✅ PostgreSQL: Connecté via Prisma
- ✅ Redis: Désactivé proprement (plus d'erreurs de connexion)
- ✅ ClickHouse: Fallback vers PostgreSQL activé
- ✅ WebSocket: Initialisé
- ✅ API Routes: `/api/auth`, `/api/sensors`, `/api/plants`
- ✅ Health check: `/health`
- ✅ Documentation: `/api/docs`

### Frontend ⚠️ EN COURS
- **Statut**: Déployé mais URL à vérifier
- **Branche**: `master` 
- **Clever Cloud alias**: `virida_app` (selon .clever.json)
- **App ID**: `app_4fdbaf24-6225-4bc5-a2bb-84319ea72bfb`

#### Configuration:
- **VITE_API_URL**: Configuré pour pointer vers le backend déployé
- **Build**: Vite + TypeScript

## Tâches accomplies récemment

1. ✅ **Création branche master backend** - Pour compatibilité Clever Cloud
2. ✅ **Liaison GitHub ↔ Clever Cloud** - Repository connecté au serveur
3. ✅ **Configuration variables d'environnement** - JWT secrets et DATABASE_URL
4. ✅ **Fix Redis** - Modification du service Redis pour respecter `REDIS_ENABLED=false`
5. ✅ **Déploiement backend** - Fonctionnel sans erreurs Redis

## Tâche en cours

🔄 **Test authentification complète** - Vérifier le flow frontend ↔ backend

## Structure des fichiers importants

### Backend
```
backend/virida_api/
├── src/
│   ├── routes/auth.js          # Routes authentification (register, login, logout, refresh)
│   ├── services/redis.js       # Service Redis avec support REDIS_ENABLED
│   ├── services/clickhouseService.js # Service ClickHouse avec fallback PostgreSQL
│   ├── server.js              # Serveur principal Express
│   └── utils/logger.js        # Logger Winston
├── .clever.json               # Configuration Clever Cloud
├── .env                       # Variables d'environnement locales
└── package.json
```

### Frontend
```
frontend/virida_app/
├── src/
│   ├── components/
│   │   ├── auth/              # Composants authentification
│   │   └── layout/Header.tsx  # Header avec navigation
│   ├── contexts/             # Contexts React (AuthContext, etc.)
│   ├── hooks/               # Hooks personnalisés
│   └── services/api.ts      # Client API
├── .clever.json            # Configuration Clever Cloud
├── .env                    # VITE_API_URL configuré
└── package.json
```

## Authentification - Flow complet

### Routes backend disponibles:
- `POST /api/auth/register` - Inscription utilisateur
- `POST /api/auth/login` - Connexion utilisateur  
- `POST /api/auth/logout` - Déconnexion
- `POST /api/auth/refresh` - Renouvellement token
- `GET /api/auth/profile` - Profil utilisateur
- `PUT /api/auth/profile` - Mise à jour profil

### Tokens JWT:
- **Access Token**: Durée courte (15min), pour authentification API
- **Refresh Token**: Durée longue (7 jours), stocké en session DB
- **Stockage**: Cookies httpOnly côté frontend

## Problèmes résolus

### Redis Connection Errors ✅
**Problème**: Le backend tentait de se connecter à Redis même avec `REDIS_ENABLED=false`
**Solution**: Modification du service Redis pour vérifier la variable d'environnement avant connexion
**Code modifié**: `src/services/redis.js` - Ajout de vérifications `if (!client) return` dans toutes les fonctions

### ClickHouse Fallback ✅  
**Problème**: ClickHouse non disponible en production
**Solution**: Fallback automatique vers PostgreSQL configuré et fonctionnel

## Configuration Clever Cloud

### Backend App
```json
{
  "app_id": "app_ff40e2dd-3bab-4a9b-82c4-8aa517a9a3f6",
  "alias": "viridaapi",
  "deploy_url": "https://push-n3-par-clevercloud-customers.services.clever-cloud.com/app_ff40e2dd-3bab-4a9b-82c4-8aa517a9a3f6.git"
}
```

### Frontend App  
```json
{
  "app_id": "app_4fdbaf24-6225-4bc5-a2bb-84319ea72bfb", 
  "alias": "virida_app",
  "deploy_url": "https://push-n3-par-clevercloud-customers.services.clever-cloud.com/app_4fdbaf24-6225-4bc5-a2bb-84319ea72bfb.git"
}
```

## Commandes utiles

### Backend
```bash
# Logs en temps réel
clever logs --alias viridaapi

# Redémarrer l'app
clever restart --alias viridaapi

# Variables d'environnement
clever env --alias viridaapi
clever env set VARIABLE_NAME "value" --alias viridaapi

# Déploiement
git push clever master
```

### Frontend
```bash
# Status de l'app
clever status --alias virida_app

# Logs
clever logs --alias virida_app

# Déploiement  
git push clever master
```

## Prochaines étapes suggérées

1. **Vérifier URL frontend** - Confirmer l'URL correcte de l'app frontend déployée
2. **Test authentification** - Tester register/login/logout complet
3. **Vérifier CORS** - S'assurer que le backend accepte les requêtes du frontend
4. **Test WebSocket** - Vérifier la connexion temps réel
5. **Monitoring** - Surveiller les logs pour d'éventuelles erreurs

## Informations de débogage

### Logs backend récents (sans erreurs Redis):
```
✅ Connexion à la base de données établie
✅ Schéma de base de données vérifié  
✅ Base de données initialisée
⚠️ Redis désactivé via REDIS_ENABLED=false
✅ Redis connecté
⚠️ ClickHouse non disponible, fallback PostgreSQL activé
✅ WebSocket server initialized
✅ WebSocket configuré
🚀 Serveur Virida API démarré sur http://0.0.0.0:8080
```

### URLs de test:
- **Backend Health**: https://app-ff40e2dd-3bab-4a9b-82c4-8aa517a9a3f6.cleverapps.io/health
- **Backend Docs**: https://app-ff40e2dd-3bab-4a9b-82c4-8aa517a9a3f6.cleverapps.io/api/docs
- **Frontend**: https://app-4fdbaf24-6225-4bc5-a2bb-84319ea72bfb.cleverapps.io (à vérifier)

## Notes importantes

- **Branche de déploiement**: Utiliser `master` (pas `main`) pour Clever Cloud
- **Redis**: Actuellement désactivé en production, peut être réactivé si service Redis ajouté
- **Base de données**: PostgreSQL fourni par Clever Cloud, connexion stable
- **Sécurité**: JWT secrets configurés, CORS à vérifier pour production
- **Monitoring**: Logs Clever Cloud disponibles via CLI

## Contexte utilisateur

L'utilisateur (lekrikri) travaille sur WSL Ubuntu, utilise Windsurf IDE, et souhaite une application complètement fonctionnelle avec authentification bout-en-bout entre frontend et backend déployés sur Clever Cloud.

---

*Document créé le 2025-09-12 pour transition vers Claude AI*
