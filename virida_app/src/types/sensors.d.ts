export enum SensorType {
  TEMPERATURE = 'TEMPERATURE',
  HUMIDITY = 'HUMIDITY',
  PH = 'PH',
  LIGHT = 'LIGHT',
  WATER_LEVEL = 'WATER_LEVEL',
  NUTRIENTS = 'NUTRIENTS'
}

export interface SensorData {
  id: string;
  type: SensorType;
  value: number;
  unit: string;
  timestamp: Date;
  location: { x: number; y: number; z: number };
  status: 'normal' | 'warning' | 'alert';
}

export interface HistoricalData {
  sensorId: string;
  data: Array<{
    timestamp: Date;
    value: number;
  }>;
}

export interface AlertThreshold {
  sensorType: SensorType;
  min: number;
  max: number;
}

export interface SystemStatus {
  isOnline: boolean;
  lastUpdate: Date;
  activeAlerts: number;
  systemHealth: 'good' | 'warning' | 'critical';
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  chartPeriod: '24h' | '7d' | '30d';
  refreshRate: number;
  notifications: boolean;
}