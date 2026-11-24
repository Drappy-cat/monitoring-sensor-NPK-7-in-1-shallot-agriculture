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
  TotalCycle?: number;
  Count?: number;
  Debit?: number;
  TotalDebit?: number;
  AvgMoisture?: number;
  Duration?: string;
  Note?: string;
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

// Riwayat transisi siklus buka-tutup katup solenoid aktual dari dataset kalibrasi Firebase
export const HISTORICAL_VALVE_EVENTS: ValveEvent[] = [
  {
    DateTime: '2026-11-24 01:00:17',
    ValveStatus: 'CLOSED',
    Looping: 1,
    TotalCycle: 18,
    Count: 0,
    Debit: 0.0,
    TotalDebit: 1564.4,
    AvgMoisture: 52.6,
    Duration: '50m 53s',
    Note: 'Katup DITUTUP setelah mengalirkan 1564.4 L air (Target debit tercapai, Siklus #1 selesai)',
  },
  {
    DateTime: '2026-11-24 00:09:24',
    ValveStatus: 'OPEN',
    Looping: 1,
    TotalCycle: 18,
    Count: 0,
    Debit: 5.5,
    TotalDebit: 0.0,
    AvgMoisture: 30.9,
    Duration: '-',
    Note: 'Katup DIBUKA untuk irigasi kalibrasi 4 sensor NPK 7-in-1 (Siklus #1 mulai)',
  },
  {
    DateTime: '2026-11-23 22:47:48',
    ValveStatus: 'CLOSED',
    Looping: 17,
    TotalCycle: 17,
    Count: 156,
    Debit: 0.0,
    TotalDebit: 217.8,
    AvgMoisture: 35.9,
    Duration: '2m 38s',
    Note: 'Katup DITUTUP (Siklus pengujian #17 selesai)',
  },
  {
    DateTime: '2026-11-23 22:45:10',
    ValveStatus: 'OPEN',
    Looping: 17,
    TotalCycle: 17,
    Count: 0,
    Debit: 5.73,
    TotalDebit: 162.2,
    AvgMoisture: 35.9,
    Duration: '-',
    Note: 'Katup DIBUKA (Siklus pengujian #17)',
  },
  {
    DateTime: '2026-11-23 22:45:08',
    ValveStatus: 'CLOSED',
    Looping: 16,
    TotalCycle: 16,
    Count: 180,
    Debit: 0.0,
    TotalDebit: 220.0,
    AvgMoisture: 35.8,
    Duration: '3m 01s',
    Note: 'Katup DITUTUP (Siklus pengujian #16 selesai)',
  },
  {
    DateTime: '2026-11-23 22:42:07',
    ValveStatus: 'OPEN',
    Looping: 16,
    TotalCycle: 16,
    Count: 0,
    Debit: 5.6,
    TotalDebit: 193.3,
    AvgMoisture: 35.8,
    Duration: '-',
    Note: 'Katup DIBUKA (Siklus pengujian #16)',
  },
  {
    DateTime: '2026-11-23 22:42:02',
    ValveStatus: 'CLOSED',
    Looping: 15,
    TotalCycle: 15,
    Count: 178,
    Debit: 0.0,
    TotalDebit: 217.8,
    AvgMoisture: 35.6,
    Duration: '3m 00s',
    Note: 'Katup DITUTUP (Siklus pengujian #15 selesai)',
  },
  {
    DateTime: '2026-11-23 22:39:02',
    ValveStatus: 'OPEN',
    Looping: 15,
    TotalCycle: 15,
    Count: 0,
    Debit: 5.4,
    TotalDebit: 93.3,
    AvgMoisture: 35.5,
    Duration: '-',
    Note: 'Katup DIBUKA (Siklus pengujian #15)',
  },
  {
    DateTime: '2026-11-23 22:35:56',
    ValveStatus: 'CLOSED',
    Looping: 13,
    TotalCycle: 13,
    Count: 179,
    Debit: 0.0,
    TotalDebit: 220.0,
    AvgMoisture: 34.3,
    Duration: '3m 00s',
    Note: 'Katup DITUTUP (Siklus pengujian #13 selesai)',
  },
  {
    DateTime: '2026-11-23 22:32:56',
    ValveStatus: 'OPEN',
    Looping: 13,
    TotalCycle: 13,
    Count: 0,
    Debit: 5.3,
    TotalDebit: 162.2,
    AvgMoisture: 34.2,
    Duration: '-',
    Note: 'Katup DIBUKA (Siklus pengujian #13)',
  },
  {
    DateTime: '2026-11-23 22:32:53',
    ValveStatus: 'CLOSED',
    Looping: 12,
    TotalCycle: 12,
    Count: 179,
    Debit: 0.0,
    TotalDebit: 260.0,
    AvgMoisture: 34.3,
    Duration: '3m 01s',
    Note: 'Katup DITUTUP (Siklus pengujian #12 selesai)',
  },
  {
    DateTime: '2026-11-23 22:29:52',
    ValveStatus: 'OPEN',
    Looping: 12,
    TotalCycle: 12,
    Count: 0,
    Debit: 5.2,
    TotalDebit: 162.2,
    AvgMoisture: 34.1,
    Duration: '-',
    Note: 'Katup DIBUKA (Siklus pengujian #12)',
  },
];
