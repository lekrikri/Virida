import { useEffect, useCallback } from 'react';
import axios from 'axios';
import { useSensorStore } from '../store/sensorStore';
import type { SensorData, SensorType } from '../types/sensors';

// Mock data generation
const generateMockData = (type: SensorType): number => {
  const ranges = {
    [SensorType.TEMPERATURE]: { min: 18, max: 30 },
    [SensorType.HUMIDITY]: { min: 40, max: 80 },
    [SensorType.PH]: { min: 5.5, max: 7.5 },
    [SensorType.LIGHT]: { min: 1000, max: 10000 },
    [SensorType.WATER_LEVEL]: { min: 60, max: 100 },
    [SensorType.NUTRIENTS]: { min: 300, max: 700 },
  };

  const range = ranges[type];
  return Math.random() * (range.max - range.min) + range.min;
};

export const useSensorData = (sensorId: string) => {
  const { updateSensorData, sensorData } = useSensorStore();

  const fetchSensorData = useCallback(async () => {
    try {
      // In production, this would be a real API call
      // const response = await axios.get(`/api/sensors/${sensorId}`);
      
      // For development, generate mock data
      const mockData: SensorData = {
        id: sensorId,
        type: SensorType.TEMPERATURE,
        value: generateMockData(SensorType.TEMPERATURE),
        unit: '°C',
        timestamp: new Date(),
        location: { x: 0, y: 0, z: 0 },
        status: 'normal',
      };

      updateSensorData(mockData);
    } catch (error) {
      console.error('Error fetching sensor data:', error);
    }
  }, [sensorId, updateSensorData]);

  useEffect(() => {
    fetchSensorData();
    const interval = setInterval(fetchSensorData, 5000);
    return () => clearInterval(interval);
  }, [fetchSensorData]);

  return {
    data: sensorData.get(sensorId),
    refetch: fetchSensorData,
  };
};