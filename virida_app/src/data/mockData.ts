// Mock data for development and testing
import { User } from '../auth/rbac';

export interface Plant {
  id: string;
  name: string;
  zone: string;
  growthStage: string;
  health: number;
  daysToHarvest: number;
}

export interface Zone {
  id: string;
  name: string;
  position: [number, number, number];
  dimensions: [number, number, number];
}

export interface SensorData {
  id: string;
  type: string;
  value: number;
  position: [number, number, number];
  zone: string;
}

export interface Schedule {
  id: string;
  type: string;
  zone: string;
  frequency: string;
  duration: number;
  startTime?: string;
  endTime?: string;
  description: string;
}

export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
  zone?: string;
  acknowledged: boolean;
}

export interface ResourceUsage {
  id: string;
  type: string;
  zone: string;
  value: number;
  unit: string;
  timestamp: string;
}

// Sample Users
export const mockUsers: User[] = [
  {
    id: 'admin-1',
    email: 'admin@virida.com',
    roles: ['admin'],
  },
  {
    id: 'manager-1',
    email: 'manager@virida.com',
    roles: ['manager'],
  },
  {
    id: 'tech-1',
    email: 'tech@virida.com',
    roles: ['technician'],
  },
  {
    id: 'operator-1',
    email: 'operator@virida.com',
    roles: ['operator'],
  },
  {
    id: 'viewer-1',
    email: 'viewer@virida.com',
    roles: ['viewer'],
  },
];

// Sample Plants
export const mockPlants: Plant[] = [
  {
    id: 'plant-1',
    name: 'Tomatoes',
    zone: 'Zone 1',
    growthStage: 'Flowering',
    health: 95,
    daysToHarvest: 45,
  },
  {
    id: 'plant-2',
    name: 'Lettuce',
    zone: 'Zone 2',
    growthStage: 'Vegetative',
    health: 98,
    daysToHarvest: 15,
  },
  {
    id: 'plant-3',
    name: 'Cucumbers',
    zone: 'Zone 3',
    growthStage: 'Fruiting',
    health: 92,
    daysToHarvest: 30,
  },
];

// Sample Schedules
export const mockSchedules: Schedule[] = [
  {
    id: 'irr-1',
    type: 'irrigation',
    zone: 'Zone 1',
    frequency: 'Every 4 hours',
    duration: 15,
    description: 'Regular irrigation schedule for Zone 1',
  },
  {
    id: 'irr-2',
    type: 'irrigation',
    zone: 'Zone 2',
    frequency: 'Every 3 hours',
    duration: 10,
    description: 'Regular irrigation schedule for Zone 2',
  },
  {
    id: 'irr-3',
    type: 'irrigation',
    zone: 'Zone 3',
    frequency: 'Every 6 hours',
    duration: 20,
    description: 'Regular irrigation schedule for Zone 3',
  },
  {
    id: 'light-1',
    type: 'lighting',
    zone: 'Zone 1',
    frequency: 'Daily',
    duration: 960,
    startTime: '06:00',
    endTime: '22:00',
    description: 'Daily lighting schedule for Zone 1',
  },
  {
    id: 'light-2',
    type: 'lighting',
    zone: 'Zone 2',
    frequency: 'Daily',
    duration: 840,
    startTime: '07:00',
    endTime: '21:00',
    description: 'Daily lighting schedule for Zone 2',
  },
  {
    id: 'light-3',
    type: 'lighting',
    zone: 'Zone 3',
    frequency: 'Daily',
    duration: 720,
    startTime: '08:00',
    endTime: '20:00',
    description: 'Daily lighting schedule for Zone 3',
  },
  {
    id: 'maint-1',
    type: 'maintenance',
    zone: 'All',
    frequency: 'Weekly',
    duration: 60,
    description: 'Filter Cleaning',
  },
  {
    id: 'maint-2',
    type: 'maintenance',
    zone: 'All',
    frequency: 'Monthly',
    duration: 120,
    description: 'Sensor Calibration',
  },
  {
    id: 'maint-3',
    type: 'maintenance',
    zone: 'All',
    frequency: 'Daily',
    duration: 30,
    description: 'System Inspection',
  },
];

// Sample Alerts
export const mockAlerts: Alert[] = [
  {
    id: 'alert-1',
    type: 'critical',
    message: 'High temperature in Zone 3',
    timestamp: '2025-02-18T13:15:00',
    zone: 'Zone 3',
    acknowledged: false,
  },
  {
    id: 'alert-2',
    type: 'warning',
    message: 'CO2 levels below optimal in Zone 1',
    timestamp: '2025-02-18T13:20:00',
    zone: 'Zone 1',
    acknowledged: false,
  },
  {
    id: 'alert-3',
    type: 'warning',
    message: 'Light intensity fluctuation in Zone 2',
    timestamp: '2025-02-18T13:25:00',
    zone: 'Zone 2',
    acknowledged: false,
  },
  {
    id: 'alert-4',
    type: 'warning',
    message: 'Nutrient imbalance detected in Zone 3',
    timestamp: '2025-02-18T13:30:00',
    zone: 'Zone 3',
    acknowledged: false,
  },
  {
    id: 'alert-5',
    type: 'info',
    message: 'Scheduled maintenance due in 2 days',
    timestamp: '2025-02-18T13:35:00',
    acknowledged: true,
  },
  {
    id: 'alert-6',
    type: 'info',
    message: 'Weekly report generated',
    timestamp: '2025-02-18T13:40:00',
    acknowledged: true,
  },
];

// Sample Resource Usage
export const mockResourceUsage: ResourceUsage[] = [
  {
    id: 'water-1',
    type: 'water',
    zone: 'Zone 1',
    value: 75,
    unit: 'L/h',
    timestamp: '2025-02-18T13:45:00',
  },
  {
    id: 'water-2',
    type: 'water',
    zone: 'Zone 2',
    value: 60,
    unit: 'L/h',
    timestamp: '2025-02-18T13:45:00',
  },
  {
    id: 'water-3',
    type: 'water',
    zone: 'Zone 3',
    value: 85,
    unit: 'L/h',
    timestamp: '2025-02-18T13:45:00',
  },
  {
    id: 'energy-1',
    type: 'energy',
    zone: 'Lighting',
    value: 4.5,
    unit: 'kW',
    timestamp: '2025-02-18T13:45:00',
  },
  {
    id: 'energy-2',
    type: 'energy',
    zone: 'HVAC',
    value: 2.8,
    unit: 'kW',
    timestamp: '2025-02-18T13:45:00',
  },
  {
    id: 'energy-3',
    type: 'energy',
    zone: 'Pumps',
    value: 0.9,
    unit: 'kW',
    timestamp: '2025-02-18T13:45:00',
  },
  {
    id: 'co2-1',
    type: 'co2',
    zone: 'Zone 1',
    value: 0.8,
    unit: 'kg/h',
    timestamp: '2025-02-18T13:45:00',
  },
  {
    id: 'co2-2',
    type: 'co2',
    zone: 'Zone 2',
    value: 0.6,
    unit: 'kg/h',
    timestamp: '2025-02-18T13:45:00',
  },
  {
    id: 'co2-3',
    type: 'co2',
    zone: 'Zone 3',
    value: 0.7,
    unit: 'kg/h',
    timestamp: '2025-02-18T13:45:00',
  },
];

// Sample Sensors
export const mockSensors: SensorData[] = [
  {
    id: 'temp1',
    type: 'temperature',
    value: 23.5,
    position: [-2, 1, -2],
    zone: 'zone1'
  },
  {
    id: 'temp2',
    type: 'temperature',
    value: 24.2,
    position: [2, 1, -2],
    zone: 'zone2'
  },
  {
    id: 'hum1',
    type: 'humidity',
    value: 65,
    position: [-2, 1, 2],
    zone: 'zone1'
  },
  {
    id: 'hum2',
    type: 'humidity',
    value: 68,
    position: [2, 1, 2],
    zone: 'zone2'
  },
  {
    id: 'co2_1',
    type: 'co2',
    value: 450,
    position: [0, 2, 0],
    zone: 'zone1'
  },
  {
    id: 'light1',
    type: 'light',
    value: 75,
    position: [0, 3, 0],
    zone: 'zone2'
  }
];

// Sample Zones
export const mockZones: Zone[] = [
  {
    id: 'zone1',
    name: 'Zone Nord',
    position: [-2.5, 0, 0],
    dimensions: [5, 4, 5]
  },
  {
    id: 'zone2',
    name: 'Zone Sud',
    position: [2.5, 0, 0],
    dimensions: [5, 4, 5]
  }
];

// Helper function to generate random historical data
export const generateHistoricalData = (
  baseValue: number,
  variance: number,
  hours: number
) => {
  const data = [];
  for (let i = hours; i >= 0; i--) {
    data.push({
      value: baseValue + (Math.random() - 0.5) * variance,
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
    });
  }
  return data;
};
