export interface SensorData {
  Moisture: number;
  Temperature: number;
  Conductivity: number;
  PH: number;
  N: number;
  P: number;
  K: number;
}

export interface Reading {
  DateTime: string;
  AvgMoisture?: number;
  Debit?: number;
  TotalDebit?: number;
  ValveStatus?: string;
  MaxLimitReached?: boolean;
  Looping?: number;
  Count?: number;
  SM1?: number;
  SM2?: number;
  SM3?: number;
  SM4?: number;
  sensor_1?: SensorData;
  sensor_2?: SensorData;
  sensor_3?: SensorData;
  sensor_4?: SensorData;
}

export interface ValveEvent {
  DateTime: string;
  ValveStatus: 'OPEN' | 'CLOSED' | string;
  Looping?: number;
  Count?: number;
  Debit?: number;
  TotalDebit?: number;
  AvgMoisture?: number;
}

export type SensorKey = 'sensor_1' | 'sensor_2' | 'sensor_3' | 'sensor_4';
export type SensorParam = 'Moisture' | 'Temperature' | 'Conductivity' | 'PH' | 'N' | 'P' | 'K';

export const SENSOR_KEYS: SensorKey[] = ['sensor_1', 'sensor_2', 'sensor_3', 'sensor_4'];

export const SENSOR_LABELS: Record<SensorKey, string> = {
  sensor_1: 'Sensor 1',
  sensor_2: 'Sensor 2',
  sensor_3: 'Sensor 3',
  sensor_4: 'Sensor 4',
};

// Clean, functional colors for distinguishing 4 sensor lines
export const SENSOR_COLORS: Record<SensorKey, string> = {
  sensor_1: '#2563eb', // blue
  sensor_2: '#059669', // emerald
  sensor_3: '#d97706', // amber
  sensor_4: '#dc2626', // red
};

// Urutan parameter sesuai Modbus register:
// Moisture (00 01), Temperature (00 00), Conductivity (00 02), PH (00 03), N (00 04), P (00 05), K (00 06)
export const ORDERED_PARAMS: SensorParam[] = [
  'Moisture',
  'Temperature',
  'Conductivity',
  'PH',
  'N',
  'P',
  'K',
];

export const PARAM_REGISTERS: Record<SensorParam, string> = {
  Moisture: '00 01',
  Temperature: '00 00',
  Conductivity: '00 02',
  PH: '00 03',
  N: '00 04',
  P: '00 05',
  K: '00 06',
};

export const PARAM_UNITS: Record<SensorParam, string> = {
  Moisture: '%',
  Temperature: '°C',
  Conductivity: 'µS/cm',
  PH: '',
  N: 'mg/kg',
  P: 'mg/kg',
  K: 'mg/kg',
};

export const PARAM_LABELS: Record<SensorParam, string> = {
  Moisture: 'Soil Moisture (Kelembaban Tanah)',
  Temperature: 'Temperature (Suhu Tanah)',
  Conductivity: 'Electrical Conductivity (EC)',
  PH: 'pH Level (Keasaman Tanah)',
  N: 'Nitrogen (N)',
  P: 'Phosphorus (P)',
  K: 'Potassium (K)',
};
