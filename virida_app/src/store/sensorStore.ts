import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { SensorData, HistoricalData, SystemStatus, UserPreferences, AlertThreshold } from '../types/sensors';

interface SensorStore {
  // Real-time sensor data
  sensorData: Map<string, SensorData>;
  historicalData: Map<string, HistoricalData>;
  systemStatus: SystemStatus;
  userPreferences: UserPreferences;
  alertThresholds: AlertThreshold[];
  
  // Actions
  updateSensorData: (data: SensorData) => void;
  updateHistoricalData: (sensorId: string, data: HistoricalData) => void;
  setSystemStatus: (status: SystemStatus) => void;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void;
  setAlertThresholds: (thresholds: AlertThreshold[]) => void;
}

export const useSensorStore = create<SensorStore>()(
  devtools(
    (set) => ({
      sensorData: new Map(),
      historicalData: new Map(),
      systemStatus: {
        isOnline: true,
        lastUpdate: new Date(),
        activeAlerts: 0,
        systemHealth: 'good',
      },
      userPreferences: {
        theme: 'light',
        chartPeriod: '24h',
        refreshRate: 5000,
        notifications: true,
      },
      alertThresholds: [],

      updateSensorData: (data) =>
        set((state) => {
          const newSensorData = new Map(state.sensorData);
          newSensorData.set(data.id, data);
          return { sensorData: newSensorData };
        }),

      updateHistoricalData: (sensorId, data) =>
        set((state) => {
          const newHistoricalData = new Map(state.historicalData);
          newHistoricalData.set(sensorId, data);
          return { historicalData: newHistoricalData };
        }),

      setSystemStatus: (status) =>
        set(() => ({ systemStatus: status })),

      updateUserPreferences: (preferences) =>
        set((state) => ({
          userPreferences: { ...state.userPreferences, ...preferences },
        })),

      setAlertThresholds: (thresholds) =>
        set(() => ({ alertThresholds: thresholds })),
    }),
    { name: 'sensor-store' }
  )
);