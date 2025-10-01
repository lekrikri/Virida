# Prompt IA - HUD Hybride Virida : Intégration Three.js + Interface Moderne

## Contexte du projet

**Virida** est une application de gestion de serre intelligente avec un backend Node.js/Express et un frontend React/TypeScript déployés sur Clever Cloud. L'objectif est de créer un HUD hybride combinant l'interface existante (navigation verte + canvas 3D Three.js) avec un dashboard moderne de monitoring temps réel.

## Architecture technique existante

### Backend API
- **URL**: https://app-ff40e2dd-3bab-4a9b-82c4-8aa517a9a3f6.cleverapps.io
- **Authentification**: JWT avec refresh tokens
- **WebSocket**: Données temps réel
- **Base de données**: PostgreSQL + ClickHouse (fallback)

### Frontend actuel (virida_app)
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Canvas 3D**: Three.js (cube/serre 3D interactif)
- **Navigation**: Sidebar verte avec menu vertical
- **Layout**: Navigation gauche + zone centrale + widgets droite

## Analyse des interfaces existantes

### Interface actuelle Virida (Image 1 - Blanc/Vert)
**Points forts à conserver :**
- ✅ Navigation sidebar verte (Dashboard, Plants, Monitoring, etc.)
- ✅ Canvas 3D Three.js central avec cube/serre interactif
- ✅ Widgets de données à droite (Temperature, Humidity, pH)
- ✅ Design propre et épuré
- ✅ Branding Virida cohérent

**Points à améliorer :**
- Widgets trop simples (manque de détails)
- Pas d'animations temps réel
- Interface statique sans interactivité avancée

### Interface HUD Bolt.new (Image 2 - Bleu foncé)
**Points forts à intégrer :**
- ✅ Design HUD futuriste avec fond sombre
- ✅ Widgets détaillés avec graphiques
- ✅ Grille de métriques organisée
- ✅ Effets visuels modernes (glassmorphism)
- ✅ Panneau de contrôles système
- ✅ Alertes et notifications

## Objectif : Interface hybride optimale

Créer une interface qui combine :
1. **Navigation Virida** (sidebar verte) - **CONSERVER**
2. **Canvas 3D Three.js** au centre - **AMÉLIORER**
3. **Widgets HUD modernes** autour du canvas - **INTÉGRER**
4. **Fond sombre** pour effet HUD - **ADOPTER**

## Spécifications détaillées de l'interface hybride

### 🎨 Layout et structure

#### Zone de navigation (gauche - 250px)
```
┌─────────────────┐
│ 🌱 VIRIDA      │ ← Header vert conservé
├─────────────────┤
│ 📊 Dashboard   │
│ 🌿 Plants      │ ← Menu vertical conservé
│ 📈 Monitoring  │   (même structure)
│ 💧 Irrigation  │
│ 🤖 Automation │
│ ⚡ Energy      │
│ 📋 Reports     │
│ ⚙️ Settings    │
└─────────────────┘
```

#### Zone centrale (canvas 3D + widgets)
```
┌─────────────────────────────────────────────────────────────┐
│ Widgets Top (Métriques principales - 4 cartes horizontales) │
├─────────────────────────────────────────────────────────────┤
│ Widget L │        CANVAS 3D THREE.JS        │ Widget R │
│ (Alertes)│      (Serre interactive)         │(Contrôles)│
│          │                                  │          │
│ Widget L2│                                  │ Widget R2│
│ (Système)│                                  │(Historiq)│
├─────────────────────────────────────────────────────────────┤
│ Widgets Bottom (Graphiques temps réel - 2 cartes)          │
└─────────────────────────────────────────────────────────────┘
```

### 🎯 Composants à créer/modifier

#### 1. Layout principal hybride
```typescript
// HybridDashboardLayout.tsx
interface HybridLayoutProps {
  children: React.ReactNode;
}

const HybridDashboardLayout: React.FC<HybridLayoutProps> = () => {
  return (
    <div className="flex h-screen bg-gray-900"> {/* Fond sombre HUD */}
      <GreenSidebar /> {/* Navigation verte conservée */}
      <main className="flex-1 p-4">
        <MetricsTopBar />
        <div className="grid grid-cols-12 gap-4 h-full">
          <AlertsPanel className="col-span-2" />
          <ThreeJSCanvas className="col-span-8" />
          <ControlsPanel className="col-span-2" />
        </div>
        <RealTimeChartsBottom />
      </main>
    </div>
  );
};
```

#### 2. Canvas Three.js amélioré
```typescript
// EnhancedThreeJSCanvas.tsx
const EnhancedThreeJSCanvas: React.FC = () => {
  // Conserver le cube/serre 3D existant
  // Ajouter des animations temps réel
  // Intégrer les données capteurs dans la visualisation 3D
  
  return (
    <div className="relative bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
      <canvas ref={canvasRef} className="w-full h-full" />
      {/* Overlay avec infos contextuelles */}
      <div className="absolute top-4 left-4">
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-2">
          <span className="text-green-400 text-sm">Serre Principale</span>
        </div>
      </div>
    </div>
  );
};
```

#### 3. Widgets HUD modernes
```typescript
// Widgets avec design HUD mais données Virida
- MetricsTopBar.tsx     // 4 métriques principales horizontales
- AlertsPanel.tsx       // Panneau alertes gauche
- ControlsPanel.tsx     // Contrôles système droite
- SystemStatusWidget.tsx // État des systèmes
- HistoryWidget.tsx     // Données historiques
- RealTimeCharts.tsx    // Graphiques temps réel bottom
```

### 🎨 Palette de couleurs hybride

#### Couleurs principales
- **Navigation**: Vert Virida conservé (#10B981, #059669)
- **Fond HUD**: Gris foncé (#0F172A, #1E293B, #334155)
- **Widgets**: Glassmorphism avec bordures (#374151 + backdrop-blur)
- **Accents**: Bleu tech (#3B82F6) + Orange alerte (#F59E0B)
- **Texte**: Blanc/gris clair pour contraste HUD

#### Effets visuels
```css
/* Style glassmorphism pour widgets */
.hud-widget {
  background: rgba(30, 41, 59, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px;
}

/* Animation pulse pour données temps réel */
.real-time-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

### 📊 Widgets spécifiques à créer

#### 1. Métriques Top Bar (4 cartes horizontales)
```typescript
const metricsConfig = [
  {
    title: "Température",
    value: "24.5°C",
    trend: "+0.3°C",
    status: "optimal",
    icon: "🌡️",
    color: "green"
  },
  {
    title: "Humidité",
    value: "65%",
    trend: "-2%",
    status: "good", 
    icon: "💧",
    color: "blue"
  },
  {
    title: "Luminosité",
    value: "850 lux",
    trend: "+50 lux",
    status: "optimal",
    icon: "☀️",
    color: "yellow"
  },
  {
    title: "pH Sol",
    value: "6.5",
    trend: "stable",
    status: "optimal",
    icon: "🌱",
    color: "green"
  }
];
```

#### 2. Panneau Alertes (gauche)
- Alertes temps réel avec priorité
- Notifications système
- Actions recommandées
- Historique des événements

#### 3. Panneau Contrôles (droite)
- Contrôles irrigation
- Gestion éclairage
- Ventilation/chauffage
- Modes automatiques

#### 4. Graphiques temps réel (bottom)
- Tendances température/humidité
- Consommation énergétique
- Croissance des plantes
- Prédictions IA

### 🔧 Intégration Three.js améliorée

#### Fonctionnalités à ajouter au canvas 3D
```typescript
// Améliorations du canvas Three.js existant
interface ThreeJSEnhancements {
  // Visualisation données temps réel
  temperatureHeatmap: boolean;     // Heatmap température sur la serre
  humidityParticles: boolean;      // Particules pour humidité
  lightingEffects: boolean;        // Simulation éclairage LED
  plantGrowthAnimation: boolean;   // Animation croissance plantes
  
  // Interactivité
  clickableZones: boolean;         // Zones cliquables pour détails
  cameraControls: boolean;         // Contrôles caméra améliorés
  tooltips: boolean;               // Infobulles contextuelles
  
  // Données temps réel
  sensorDataOverlay: boolean;      // Overlay données capteurs
  alertsVisualization: boolean;    // Visualisation alertes 3D
  systemStatusIndicators: boolean; // Indicateurs état systèmes
}
```

### 📱 Responsive design

#### Desktop (1920px+)
- Layout complet avec sidebar + canvas central + widgets
- Canvas 3D en pleine résolution
- Tous les widgets visibles

#### Tablet (768px-1919px)
- Sidebar rétractable
- Canvas 3D redimensionné
- Widgets empilés sur 2 colonnes

#### Mobile (< 768px)
- Navigation bottom bar
- Canvas 3D en mode portrait
- Widgets en stack vertical
- Swipe entre vues

### 🚀 Technologies et dépendances

#### Existantes (à conserver)
- React 18 + TypeScript
- Tailwind CSS
- Three.js (canvas 3D)
- Vite

#### Nouvelles (à ajouter)
```json
{
  "dependencies": {
    "framer-motion": "^10.16.4",      // Animations fluides
    "recharts": "^2.8.0",             // Graphiques
    "react-query": "^3.39.3",         // État serveur
    "socket.io-client": "^4.7.2",     // WebSocket
    "lucide-react": "^0.263.1",       // Icônes
    "react-hot-toast": "^2.4.1",      // Notifications
    "@react-three/fiber": "^8.13.6",  // Three.js React
    "@react-three/drei": "^9.79.0"    // Helpers Three.js
  }
}
```

### 🎯 Livrables attendus

#### 1. Composants React complets
- HybridDashboardLayout.tsx (layout principal)
- EnhancedThreeJSCanvas.tsx (canvas amélioré)
- 8 widgets HUD modernes
- 5 hooks personnalisés

#### 2. Styles et animations
- Classes Tailwind optimisées
- Animations Framer Motion
- Effets glassmorphism
- Responsive breakpoints

#### 3. Intégration données
- WebSocket temps réel
- API REST pour historique
- Gestion état avec React Query
- Types TypeScript complets

#### 4. Documentation
- Guide d'installation
- Documentation composants
- Exemples d'utilisation
- Guide de migration

### 💡 Spécifications techniques détaillées

#### Structure des fichiers
```
src/
├── components/
│   ├── layout/
│   │   ├── HybridDashboardLayout.tsx
│   │   ├── GreenSidebar.tsx (conservé)
│   │   └── ResponsiveContainer.tsx
│   ├── three/
│   │   ├── EnhancedThreeJSCanvas.tsx
│   │   ├── GreenhouseScene.tsx
│   │   └── SensorOverlay.tsx
│   ├── widgets/
│   │   ├── MetricsTopBar.tsx
│   │   ├── AlertsPanel.tsx
│   │   ├── ControlsPanel.tsx
│   │   ├── SystemStatusWidget.tsx
│   │   ├── HistoryWidget.tsx
│   │   └── RealTimeCharts.tsx
│   └── ui/ (composants réutilisables)
├── hooks/
│   ├── useWebSocket.ts
│   ├── useSensorData.ts
│   ├── useThreeJS.ts
│   └── useRealTimeUpdates.ts
└── types/
    ├── sensors.ts
    ├── widgets.ts
    └── three.ts
```

#### Performance et optimisation
- Lazy loading des composants lourds
- Memoization des calculs Three.js
- Debounce des mises à jour temps réel
- Virtualisation des listes longues
- Code splitting par route

---

## Instructions pour l'IA

Crée une interface hybride qui :

1. **CONSERVE** la navigation verte Virida existante
2. **AMÉLIORE** le canvas Three.js avec des données temps réel
3. **INTÈGRE** les widgets HUD modernes autour du canvas
4. **ADOPTE** le design sombre futuriste pour l'effet HUD
5. **MAINTIENT** la cohérence avec l'architecture React/TypeScript existante

Le résultat doit être une évolution naturelle de l'interface actuelle, pas une refonte complète. L'utilisateur doit reconnaître son application Virida tout en bénéficiant d'une expérience HUD moderne et immersive.

**Priorité absolue** : Canvas Three.js central + Navigation verte conservée + Widgets HUD modernes intégrés harmonieusement.
