import { create } from 'zustand';
import { mockSensors, mockZones, mockAutomationRules, SensorData, Zone, AutomationRule } from '../data/mockData';

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

interface AutomationRule {
  id: string;
  enabled: boolean;
}

interface ViridaStore {
  sensors: SensorData[];
  zones: Zone[];
  automationRules: AutomationRule[];
  selectedZone: string | null;
  setSelectedZone: (zoneId: string | null) => void;
  updateSensorValue: (sensorId: string, value: number) => void;
  toggleAutomationRule: (ruleId: string) => void;
}

export const useViridaStore = create<ViridaStore>((set) => ({
  sensors: mockSensors,
  zones: mockZones,
  automationRules: mockAutomationRules,
  selectedZone: null,
  setSelectedZone: (zoneId) => set({ selectedZone: zoneId }),
  updateSensorValue: (sensorId, value) =>
    set((state) => ({
      sensors: state.sensors.map((sensor) =>
        sensor.id === sensorId ? { ...sensor, value } : sensor
      ),
    })),
  toggleAutomationRule: (ruleId) =>
    set((state) => ({
      automationRules: state.automationRules.map((rule) =>
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
      ),
    })),
}));
