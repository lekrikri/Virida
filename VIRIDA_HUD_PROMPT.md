# Prompt IA pour créer un HUD moderne pour Virida - Application de Gestion de Serre Intelligente

## Contexte du projet

**Virida** est une application de gestion de serre intelligente avec un backend Node.js/Express et un frontend React/TypeScript. L'application permet de monitorer et optimiser les conditions de croissance des plantes en serre.

## Architecture technique actuelle

### Frontend (virida_app)
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **État**: Context API + hooks personnalisés
- **Déploiement**: Clever Cloud
- **URL**: https://app-4fdbaf24-6225-4bc5-a2bb-84319ea72bfb.cleverapps.io

### Backend API disponible
- **Base URL**: https://app-ff40e2dd-3bab-4a9b-82c4-8aa517a9a3f6.cleverapps.io
- **Authentification**: JWT avec refresh tokens
- **WebSocket**: Données temps réel
- **Endpoints principaux**:
  - `/api/auth/*` - Authentification
  - `/api/sensors/*` - Données capteurs
  - `/api/plants/*` - Gestion des plantes
  - `/health` - Health check

## Structure actuelle du frontend

```
frontend/virida_app/
├── src/
│   ├── components/
│   │   ├── auth/              # Composants authentification
│   │   ├── layout/Header.tsx  # Header avec navigation
│   │   └── chatbot/ChatBot.tsx # Assistant IA
│   ├── contexts/             # Contexts React (AuthContext, etc.)
│   ├── hooks/               # Hooks personnalisés
│   └── services/api.ts      # Client API
├── .env                    # VITE_API_URL configuré
└── package.json
```

## Demande spécifique : Création d'un HUD moderne

Je souhaite que tu crées un **HUD (Head-Up Display) moderne et intuitif** pour l'interface Virida avec les spécifications suivantes :

### 🎯 Objectifs du HUD

1. **Dashboard principal** - Vue d'ensemble temps réel de la serre
2. **Monitoring avancé** - Visualisation des données capteurs
3. **Interface intuitive** - UX moderne et responsive
4. **Données temps réel** - Intégration WebSocket
5. **Design futuriste** - Esthétique de serre intelligente

### 📊 Données à afficher

#### Capteurs environnementaux
- **Température** : Actuelle, min/max, tendance
- **Humidité** : Pourcentage, niveau optimal
- **Luminosité** : Lux, durée d'éclairage
- **pH du sol** : Niveau, recommandations
- **Humidité du sol** : Pourcentage par zone
- **CO2** : Concentration, ventilation

#### État des plantes
- **Nombre total** de plantes
- **Stades de croissance** : Semis, croissance, floraison, récolte
- **Alertes** : Plantes nécessitant attention
- **Prochaines actions** : Arrosage, fertilisation

#### Systèmes automatisés
- **Irrigation** : État, prochaine activation
- **Éclairage** : Statut LED, programmation
- **Ventilation** : Vitesse, température cible
- **Chauffage/Refroidissement** : État, consommation

### 🎨 Spécifications design

#### Palette de couleurs
- **Primaire** : Vert nature (#10B981, #059669)
- **Secondaire** : Bleu tech (#3B82F6, #1D4ED8)
- **Accents** : Orange alerte (#F59E0B), Rouge critique (#EF4444)
- **Neutre** : Gris moderne (#6B7280, #374151, #1F2937)
- **Fond** : Noir/gris foncé pour effet HUD

#### Style visuel
- **Glassmorphism** : Effets de verre avec backdrop-blur
- **Néomorphisme** : Éléments en relief subtil
- **Animations fluides** : Transitions CSS et Framer Motion
- **Gradients** : Dégradés subtils pour la profondeur
- **Ombres** : Drop shadows pour la hiérarchie

#### Composants HUD
1. **Barre de statut supérieure** : Heure, météo, alertes
2. **Widgets principaux** : Cartes avec métriques clés
3. **Graphiques temps réel** : Charts.js ou Recharts
4. **Panneau latéral** : Navigation et contrôles rapides
5. **Zone centrale** : Vue principale modulable
6. **Footer** : Statut système et connexion

### 📱 Responsive design

- **Desktop** : Layout en grille 12 colonnes
- **Tablet** : Adaptation 2 colonnes principales
- **Mobile** : Stack vertical avec navigation bottom

### 🔧 Technologies à utiliser

#### Obligatoires (déjà dans le projet)
- React 18 + TypeScript
- Tailwind CSS
- Vite (build tool)

#### Recommandées pour le HUD
- **Framer Motion** : Animations avancées
- **Recharts** ou **Chart.js** : Graphiques
- **React Query** : Gestion état serveur
- **Socket.io-client** : WebSocket temps réel
- **Lucide React** : Icônes modernes
- **React Hot Toast** : Notifications

### 📋 Structure des composants à créer

```typescript
// Composants principaux
- HUDLayout.tsx           // Layout principal
- StatusBar.tsx           // Barre de statut
- MetricsGrid.tsx         // Grille de métriques
- SensorCard.tsx          // Carte capteur individuelle
- PlantStatusPanel.tsx    // Panneau état des plantes
- SystemControlPanel.tsx  // Contrôles système
- RealTimeChart.tsx       // Graphiques temps réel
- AlertsPanel.tsx         // Panneau d'alertes
- NavigationSidebar.tsx   // Navigation latérale

// Hooks personnalisés
- useWebSocket.ts         // Connexion WebSocket
- useSensorData.ts        // Données capteurs
- useRealTimeUpdates.ts   // Mises à jour temps réel
```

### 🎯 Fonctionnalités interactives

1. **Contrôles directs** : Boutons pour irrigation, éclairage
2. **Seuils configurables** : Sliders pour limites d'alerte
3. **Vues multiples** : Basculer entre dashboard, historique, contrôles
4. **Filtres temporels** : Dernière heure, jour, semaine
5. **Mode sombre/clair** : Toggle automatique selon l'heure

### 📊 Intégration données

#### WebSocket (temps réel)
```typescript
// Exemple de structure de données attendue
interface SensorData {
  timestamp: string;
  temperature: number;
  humidity: number;
  light: number;
  soilMoisture: number;
  ph: number;
  co2: number;
}

interface PlantStatus {
  id: string;
  name: string;
  stage: 'seedling' | 'growing' | 'flowering' | 'harvest';
  health: number; // 0-100
  lastWatered: string;
  nextAction: string;
}
```

#### API REST (historique)
- `GET /api/sensors/history` - Données historiques
- `GET /api/plants/status` - État des plantes
- `POST /api/controls/irrigation` - Contrôle irrigation
- `POST /api/controls/lighting` - Contrôle éclairage

### 🚀 Livrables attendus

1. **Composants React** complets avec TypeScript
2. **Styles Tailwind** optimisés et responsive
3. **Hooks personnalisés** pour la logique métier
4. **Configuration WebSocket** pour temps réel
5. **Documentation** des composants
6. **Exemples d'utilisation** et intégration

### 💡 Inspiration design

- **Tesla Model S Dashboard** : Minimalisme et efficacité
- **SpaceX Dragon Interface** : HUD spatial moderne
- **Smart Home Apps** : Philips Hue, Nest
- **Gaming HUDs** : Interfaces de jeux futuristes
- **Agricultural Tech** : John Deere Operations Center

### 🎨 Exemples de widgets souhaités

1. **Température Widget** : Thermomètre circulaire avec gradient
2. **Humidité Widget** : Jauge semi-circulaire avec gouttes
3. **Croissance Widget** : Timeline des stades de plantes
4. **Énergie Widget** : Consommation avec graphique en aires
5. **Météo Widget** : Prévisions avec icônes animées

---

## Instructions pour l'IA

Crée un HUD moderne, fonctionnel et esthétique pour Virida en respectant :
- L'architecture React/TypeScript existante
- L'intégration avec l'API backend
- Les principes UX/UI modernes
- La responsivité mobile-first
- L'accessibilité (WCAG 2.1)
- Les performances (lazy loading, memoization)

Le résultat doit être prêt à intégrer dans le projet existant avec des instructions claires d'installation et de configuration.

**Priorité** : Interface intuitive, données temps réel, design moderne et professionnel.
