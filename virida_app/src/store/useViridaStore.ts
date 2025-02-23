import { create } from 'zustand';
import { mockSensors, mockZones, SensorData, Zone } from '../data/mockData';

export interface SensorData {
  id: string;
  type: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'alert';
  timestamp: Date;
  history: Array<{
    value: number;
    timestamp: Date;
  }>;
}

interface Zone {
  id: string;
  name: string;
}

interface ViridaStore {
  sensors: SensorData[];
  zones: Zone[];
  selectedZone: string | null;
  setSelectedZone: (zoneId: string | null) => void;
  updateSensorValue: (sensorId: string, value: number) => void;
}

export const useViridaStore = create<ViridaStore>((set) => ({
  sensors: mockSensors,
  zones: mockZones,
  selectedZone: null,
  setSelectedZone: (zoneId) => set({ selectedZone: zoneId }),
  updateSensorValue: (sensorId, value) =>
    set((state) => ({
      sensors: state.sensors.map((sensor) =>
        sensor.id === sensorId ? { ...sensor, value } : sensor
      ),
    })),
}));
