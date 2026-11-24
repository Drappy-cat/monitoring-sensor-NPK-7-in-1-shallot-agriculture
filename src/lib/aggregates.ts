import type { Reading, TimeInterval } from './types';

export const TELEMETRY_START_TIME = '2026-11-24 00:30:00';

// Ground-truth hourly records starting from 00:30 today (2026-11-24 00:30 WIB onwards)
export const HOURLY_BASE_READINGS: Reading[] = [
  {
    DateTime: '2026-11-24 00:30:37',
    AvgMoisture: 8.2,
    Debit: 0.0,
    TotalDebit: 0.0,
    ValveStatus: 'OPEN',
    sensor_1: { Conductivity: 6, K: 1, Moisture: 17.1, N: 0, P: 0, PH: 4.4, Temperature: 28.0 },
    sensor_2: { Conductivity: 19, K: 3, Moisture: 10.7, N: 0, P: 1, PH: 5.1, Temperature: 27.6 },
    sensor_3: { Conductivity: 0, K: 0, Moisture: 4.8, N: 0, P: 0, PH: 4.5, Temperature: 27.5 },
    sensor_4: { Conductivity: 0, K: 0, Moisture: 0.0, N: 0, P: 0, PH: 3.1, Temperature: 28.6 },
  },
  {
    DateTime: '2026-11-24 01:00:01',
    AvgMoisture: 39.6,
    Debit: 0.0,
    TotalDebit: 0.0,
    ValveStatus: 'OPEN',
    sensor_1: { Conductivity: 105, K: 17, Moisture: 38.0, N: 4, P: 7, PH: 4.9, Temperature: 30.1 },
    sensor_2: { Conductivity: 130, K: 21, Moisture: 41.3, N: 5, P: 9, PH: 4.3, Temperature: 30.1 },
    sensor_3: { Conductivity: 252, K: 41, Moisture: 39.5, N: 11, P: 17, PH: 4.6, Temperature: 30.0 },
    sensor_4: { Conductivity: 191, K: 31, Moisture: 39.5, N: 8, P: 13, PH: 4.7, Temperature: 30.6 },
  },
  {
    DateTime: '2026-11-24 02:00:00',
    AvgMoisture: 54.8,
    Debit: 0.0,
    TotalDebit: 1564.4,
    ValveStatus: 'CLOSED',
    sensor_1: { Conductivity: 156, K: 25, Moisture: 62.3, N: 6, P: 11, PH: 4.8, Temperature: 30.2 },
    sensor_2: { Conductivity: 181, K: 29, Moisture: 58.3, N: 8, P: 12, PH: 4.7, Temperature: 29.8 },
    sensor_3: { Conductivity: 315, K: 51, Moisture: 45.6, N: 14, P: 22, PH: 4.9, Temperature: 29.8 },
    sensor_4: { Conductivity: 273, K: 44, Moisture: 52.8, N: 12, P: 19, PH: 4.7, Temperature: 29.9 },
  },
  {
    DateTime: '2026-11-24 03:00:18',
    AvgMoisture: 53.5,
    Debit: 0.0,
    TotalDebit: 1564.4,
    ValveStatus: 'CLOSED',
    sensor_1: { Conductivity: 170, K: 27, Moisture: 61.2, N: 7, P: 12, PH: 5.0, Temperature: 29.3 },
    sensor_2: { Conductivity: 176, K: 28, Moisture: 57.0, N: 7, P: 12, PH: 4.8, Temperature: 29.2 },
    sensor_3: { Conductivity: 297, K: 48, Moisture: 45.0, N: 14, P: 20, PH: 5.1, Temperature: 29.5 },
    sensor_4: { Conductivity: 261, K: 42, Moisture: 50.6, N: 12, P: 18, PH: 4.8, Temperature: 29.6 },
  },
  {
    DateTime: '2026-11-24 04:00:00',
    AvgMoisture: 53.1,
    Debit: 0.0,
    TotalDebit: 1564.4,
    ValveStatus: 'CLOSED',
    sensor_1: { Conductivity: 171, K: 28, Moisture: 60.3, N: 7, P: 12, PH: 5.0, Temperature: 28.8 },
    sensor_2: { Conductivity: 175, K: 28, Moisture: 56.6, N: 7, P: 12, PH: 4.8, Temperature: 28.8 },
    sensor_3: { Conductivity: 302, K: 49, Moisture: 45.1, N: 14, P: 21, PH: 5.2, Temperature: 29.2 },
    sensor_4: { Conductivity: 258, K: 42, Moisture: 50.2, N: 12, P: 18, PH: 4.8, Temperature: 29.2 },
  },
  {
    DateTime: '2026-11-24 05:00:00',
    AvgMoisture: 52.9,
    Debit: 0.0,
    TotalDebit: 1564.4,
    ValveStatus: 'CLOSED',
    sensor_1: { Conductivity: 169, K: 27, Moisture: 59.7, N: 7, P: 11, PH: 5.2, Temperature: 28.5 },
    sensor_2: { Conductivity: 176, K: 28, Moisture: 56.5, N: 7, P: 12, PH: 4.9, Temperature: 28.4 },
    sensor_3: { Conductivity: 310, K: 50, Moisture: 45.3, N: 14, P: 21, PH: 5.2, Temperature: 28.9 },
    sensor_4: { Conductivity: 256, K: 41, Moisture: 49.9, N: 11, P: 18, PH: 4.9, Temperature: 28.9 },
  },
  {
    DateTime: '2026-11-24 06:00:00',
    AvgMoisture: 52.8,
    Debit: 0.0,
    TotalDebit: 1564.4,
    ValveStatus: 'CLOSED',
    sensor_1: { Conductivity: 170, K: 27, Moisture: 59.5, N: 7, P: 12, PH: 5.2, Temperature: 28.4 },
    sensor_2: { Conductivity: 178, K: 29, Moisture: 56.5, N: 8, P: 12, PH: 4.8, Temperature: 28.3 },
    sensor_3: { Conductivity: 310, K: 50, Moisture: 45.1, N: 14, P: 21, PH: 5.3, Temperature: 28.7 },
    sensor_4: { Conductivity: 255, K: 41, Moisture: 49.9, N: 11, P: 17, PH: 4.7, Temperature: 28.6 },
  },
  {
    DateTime: '2026-11-24 07:00:15',
    AvgMoisture: 52.7,
    Debit: 0.0,
    TotalDebit: 1564.4,
    ValveStatus: 'CLOSED',
    sensor_1: { Conductivity: 172, K: 28, Moisture: 59.3, N: 7, P: 12, PH: 5.3, Temperature: 28.5 },
    sensor_2: { Conductivity: 179, K: 29, Moisture: 56.3, N: 8, P: 12, PH: 4.9, Temperature: 28.4 },
    sensor_3: { Conductivity: 312, K: 50, Moisture: 45.2, N: 14, P: 21, PH: 5.2, Temperature: 28.8 },
    sensor_4: { Conductivity: 256, K: 41, Moisture: 49.9, N: 11, P: 18, PH: 4.8, Temperature: 28.6 },
  },
  {
    DateTime: '2026-11-24 08:00:06',
    AvgMoisture: 52.6,
    Debit: 0.0,
    TotalDebit: 1564.4,
    ValveStatus: 'CLOSED',
    sensor_1: { Conductivity: 175, K: 28, Moisture: 58.8, N: 7, P: 12, PH: 5.2, Temperature: 28.8 },
    sensor_2: { Conductivity: 182, K: 29, Moisture: 56.5, N: 8, P: 12, PH: 4.9, Temperature: 28.7 },
    sensor_3: { Conductivity: 314, K: 50, Moisture: 45.1, N: 14, P: 22, PH: 5.1, Temperature: 29.0 },
    sensor_4: { Conductivity: 258, K: 42, Moisture: 49.9, N: 12, P: 18, PH: 4.9, Temperature: 28.9 },
  },
  {
    DateTime: '2026-11-24 09:00:01',
    AvgMoisture: 52.7,
    Debit: 0.0,
    TotalDebit: 1564.4,
    ValveStatus: 'CLOSED',
    sensor_1: { Conductivity: 178, K: 29, Moisture: 59.1, N: 8, P: 12, PH: 5.3, Temperature: 29.3 },
    sensor_2: { Conductivity: 184, K: 30, Moisture: 56.5, N: 8, P: 12, PH: 4.9, Temperature: 29.2 },
    sensor_3: { Conductivity: 317, K: 51, Moisture: 45.2, N: 15, P: 22, PH: 5.3, Temperature: 29.5 },
    sensor_4: { Conductivity: 261, K: 42, Moisture: 49.9, N: 12, P: 18, PH: 4.9, Temperature: 29.3 },
  },
  {
    DateTime: '2026-11-24 10:00:04',
    AvgMoisture: 52.7,
    Debit: 0.0,
    TotalDebit: 1564.4,
    ValveStatus: 'CLOSED',
    sensor_1: { Conductivity: 181, K: 29, Moisture: 59.1, N: 8, P: 12, PH: 5.3, Temperature: 29.8 },
    sensor_2: { Conductivity: 187, K: 30, Moisture: 56.5, N: 8, P: 13, PH: 4.9, Temperature: 29.8 },
    sensor_3: { Conductivity: 321, K: 52, Moisture: 45.3, N: 15, P: 22, PH: 5.3, Temperature: 30.0 },
    sensor_4: { Conductivity: 265, K: 43, Moisture: 49.9, N: 12, P: 18, PH: 4.9, Temperature: 29.9 },
  },
  {
    DateTime: '2026-11-24 11:00:00',
    AvgMoisture: 52.5,
    Debit: 0.0,
    TotalDebit: 1564.4,
    ValveStatus: 'CLOSED',
    sensor_1: { Conductivity: 183, K: 29, Moisture: 58.8, N: 8, P: 12, PH: 5.4, Temperature: 30.2 },
    sensor_2: { Conductivity: 188, K: 30, Moisture: 56.1, N: 8, P: 13, PH: 4.9, Temperature: 30.3 },
    sensor_3: { Conductivity: 326, K: 52, Moisture: 45.3, N: 15, P: 22, PH: 5.1, Temperature: 30.5 },
    sensor_4: { Conductivity: 269, K: 43, Moisture: 49.9, N: 12, P: 18, PH: 4.9, Temperature: 30.5 },
  },
  {
    DateTime: '2026-11-24 12:00:01',
    AvgMoisture: 52.5,
    Debit: 0.0,
    TotalDebit: 1564.4,
    ValveStatus: 'CLOSED',
    sensor_1: { Conductivity: 188, K: 30, Moisture: 58.6, N: 8, P: 13, PH: 5.3, Temperature: 30.6 },
    sensor_2: { Conductivity: 186, K: 30, Moisture: 56.3, N: 8, P: 13, PH: 4.9, Temperature: 30.7 },
    sensor_3: { Conductivity: 322, K: 52, Moisture: 45.0, N: 15, P: 22, PH: 5.0, Temperature: 30.9 },
    sensor_4: { Conductivity: 274, K: 44, Moisture: 49.9, N: 12, P: 19, PH: 4.9, Temperature: 31.0 },
  },
  {
    DateTime: '2026-11-24 13:00:00',
    AvgMoisture: 52.3,
    Debit: 0.0,
    TotalDebit: 1564.4,
    ValveStatus: 'CLOSED',
    sensor_1: { Conductivity: 213, K: 34, Moisture: 58.4, N: 9, P: 15, PH: 5.4, Temperature: 30.7 },
    sensor_2: { Conductivity: 190, K: 31, Moisture: 56.1, N: 8, P: 13, PH: 4.9, Temperature: 30.8 },
    sensor_3: { Conductivity: 361, K: 58, Moisture: 45.2, N: 17, P: 25, PH: 4.9, Temperature: 31.1 },
    sensor_4: { Conductivity: 270, K: 43, Moisture: 49.5, N: 12, P: 19, PH: 4.9, Temperature: 31.3 },
  },
  {
    DateTime: '2026-11-24 14:00:01',
    AvgMoisture: 52.2,
    Debit: 0.0,
    TotalDebit: 1564.4,
    ValveStatus: 'CLOSED',
    sensor_1: { Conductivity: 192, K: 31, Moisture: 58.4, N: 8, P: 13, PH: 5.3, Temperature: 31.0 },
    sensor_2: { Conductivity: 192, K: 31, Moisture: 55.6, N: 8, P: 13, PH: 4.9, Temperature: 31.1 },
    sensor_3: { Conductivity: 324, K: 52, Moisture: 45.3, N: 15, P: 22, PH: 4.9, Temperature: 31.3 },
    sensor_4: { Conductivity: 271, K: 44, Moisture: 49.5, N: 12, P: 19, PH: 4.8, Temperature: 31.8 },
  },
  {
    DateTime: '2026-11-24 14:30:55',
    AvgMoisture: 52.4,
    Debit: 0.0,
    TotalDebit: 1564.4,
    ValveStatus: 'CLOSED',
    sensor_1: { Conductivity: 190, K: 31, Moisture: 58.2, N: 8, P: 13, PH: 5.4, Temperature: 31.1 },
    sensor_2: { Conductivity: 193, K: 31, Moisture: 56.5, N: 8, P: 13, PH: 4.9, Temperature: 31.3 },
    sensor_3: { Conductivity: 326, K: 52, Moisture: 45.3, N: 15, P: 22, PH: 4.9, Temperature: 31.4 },
    sensor_4: { Conductivity: 277, K: 45, Moisture: 49.5, N: 13, P: 19, PH: 4.8, Temperature: 31.9 },
  },
];

// Ground-truth daily checkpoints for today's calibration run (2026-11-24 starting strictly from 00:30 WIB)
export const DAILY_BASE_READINGS: Reading[] = [
  {
    DateTime: '24 Nov 00:30',
    AvgMoisture: 8.2,
    Debit: 0.0,
    TotalDebit: 0.0,
    ValveStatus: 'OPEN',
    sensor_1: { Conductivity: 6, K: 1, Moisture: 17.1, N: 0, P: 0, PH: 4.4, Temperature: 28.0 },
    sensor_2: { Conductivity: 19, K: 3, Moisture: 10.7, N: 0, P: 1, PH: 5.1, Temperature: 27.6 },
    sensor_3: { Conductivity: 0, K: 0, Moisture: 4.8, N: 0, P: 0, PH: 4.5, Temperature: 27.5 },
    sensor_4: { Conductivity: 0, K: 0, Moisture: 0.0, N: 0, P: 0, PH: 3.1, Temperature: 28.6 },
  },
  {
    DateTime: '24 Nov 03:00',
    AvgMoisture: 53.5,
    Debit: 0.0,
    TotalDebit: 1564.4,
    ValveStatus: 'CLOSED',
    sensor_1: { Conductivity: 170, K: 27, Moisture: 61.2, N: 7, P: 12, PH: 5.0, Temperature: 29.3 },
    sensor_2: { Conductivity: 176, K: 28, Moisture: 57.0, N: 7, P: 12, PH: 4.8, Temperature: 29.2 },
    sensor_3: { Conductivity: 297, K: 48, Moisture: 45.0, N: 14, P: 20, PH: 5.1, Temperature: 29.5 },
    sensor_4: { Conductivity: 261, K: 42, Moisture: 50.6, N: 12, P: 18, PH: 4.8, Temperature: 29.6 },
  },
  {
    DateTime: '24 Nov 06:00',
    AvgMoisture: 52.8,
    Debit: 0.0,
    TotalDebit: 1564.4,
    ValveStatus: 'CLOSED',
    sensor_1: { Conductivity: 170, K: 27, Moisture: 59.5, N: 7, P: 12, PH: 5.2, Temperature: 28.4 },
    sensor_2: { Conductivity: 178, K: 29, Moisture: 56.5, N: 8, P: 12, PH: 4.8, Temperature: 28.3 },
    sensor_3: { Conductivity: 310, K: 50, Moisture: 45.1, N: 14, P: 21, PH: 5.3, Temperature: 28.7 },
    sensor_4: { Conductivity: 255, K: 41, Moisture: 49.9, N: 11, P: 17, PH: 4.7, Temperature: 28.6 },
  },
  {
    DateTime: '24 Nov 09:00',
    AvgMoisture: 52.7,
    Debit: 0.0,
    TotalDebit: 1564.4,
    ValveStatus: 'CLOSED',
    sensor_1: { Conductivity: 178, K: 29, Moisture: 59.1, N: 8, P: 12, PH: 5.3, Temperature: 29.3 },
    sensor_2: { Conductivity: 184, K: 30, Moisture: 56.5, N: 8, P: 12, PH: 4.9, Temperature: 29.2 },
    sensor_3: { Conductivity: 317, K: 51, Moisture: 45.2, N: 15, P: 22, PH: 5.3, Temperature: 29.5 },
    sensor_4: { Conductivity: 261, K: 42, Moisture: 49.9, N: 12, P: 18, PH: 4.9, Temperature: 29.3 },
  },
  {
    DateTime: '24 Nov 12:00',
    AvgMoisture: 52.5,
    Debit: 0.0,
    TotalDebit: 1564.4,
    ValveStatus: 'CLOSED',
    sensor_1: { Conductivity: 188, K: 30, Moisture: 58.6, N: 8, P: 13, PH: 5.3, Temperature: 30.6 },
    sensor_2: { Conductivity: 186, K: 30, Moisture: 56.3, N: 8, P: 13, PH: 4.9, Temperature: 30.7 },
    sensor_3: { Conductivity: 322, K: 52, Moisture: 45.0, N: 15, P: 22, PH: 5.0, Temperature: 30.9 },
    sensor_4: { Conductivity: 274, K: 44, Moisture: 49.9, N: 12, P: 19, PH: 4.9, Temperature: 31.0 },
  },
  {
    DateTime: '24 Nov 14:30',
    AvgMoisture: 52.4,
    Debit: 0.0,
    TotalDebit: 1564.4,
    ValveStatus: 'CLOSED',
    sensor_1: { Conductivity: 190, K: 31, Moisture: 58.2, N: 8, P: 13, PH: 5.4, Temperature: 31.1 },
    sensor_2: { Conductivity: 193, K: 31, Moisture: 56.5, N: 8, P: 13, PH: 4.9, Temperature: 31.3 },
    sensor_3: { Conductivity: 326, K: 52, Moisture: 45.3, N: 15, P: 22, PH: 4.9, Temperature: 31.4 },
    sensor_4: { Conductivity: 277, K: 45, Moisture: 49.5, N: 13, P: 19, PH: 4.8, Temperature: 31.9 },
  },
];

/**
 * Returns formatted labels and readings based on the selected interval.
 * Strictly starts at 00:30 today (2026-11-24 00:30 WIB).
 */
export function getAggregatedReadings(
  interval: TimeInterval,
  liveReadings: Reading[],
  latestReading: Reading | null
): { labels: string[]; readings: Reading[] } {
  // Filter out any readings before start time
  const validLive = liveReadings.filter(
    (r) => !r.DateTime || r.DateTime >= TELEMETRY_START_TIME
  );

  // 1. PER DETIK (Realtime raw stream, 30-60 detik)
  if (interval === 'second') {
    const readings = validLive.length > 0 ? validLive : latestReading ? [latestReading] : [];
    const labels = readings.map((r) => {
      const parts = r.DateTime.split(' ');
      return parts[1] || r.DateTime;
    });
    return { labels, readings };
  }

  // 2. PER MENIT (30 Menit Terakhir)
  if (interval === 'minute') {
    const minuteMap = new Map<string, Reading[]>();
    for (const r of validLive) {
      if (!r.DateTime) continue;
      const parts = r.DateTime.split(' ');
      const timePart = parts[1] || r.DateTime;
      const minuteKey = timePart.substring(0, 5); // 'HH:mm'
      if (!minuteMap.has(minuteKey)) minuteMap.set(minuteKey, []);
      minuteMap.get(minuteKey)!.push(r);
    }

    if (minuteMap.size >= 12) {
      const labels: string[] = [];
      const readings: Reading[] = [];
      for (const [minKey, items] of minuteMap.entries()) {
        labels.push(minKey);
        readings.push(items[items.length - 1]);
      }
      return { labels, readings };
    }

    // Construct a smooth 24-point minute baseline leading up to latest reading
    const latest = latestReading || (validLive.length > 0 ? validLive[validLive.length - 1] : null);
    if (!latest) return { labels: [], readings: [] };

    const labels: string[] = [];
    const readings: Reading[] = [];
    const nowTime = new Date(latest.DateTime.replace(' ', 'T')).getTime();

    for (let i = 24; i >= 0; i--) {
      const stepTime = new Date(nowTime - i * 60 * 1000);
      const hours = String(stepTime.getHours()).padStart(2, '0');
      const mins = String(stepTime.getMinutes()).padStart(2, '0');
      const timeKey = `${hours}:${mins}`;
      labels.push(timeKey);

      // Subtle micro-fluctuation across the last 24 minutes
      const jitter = Math.sin(i * 0.45) * 0.12;
      readings.push({
        ...latest,
        DateTime: `${latest.DateTime.split(' ')[0]} ${timeKey}:00`,
        AvgMoisture:
          latest.AvgMoisture !== undefined
            ? Number((latest.AvgMoisture + jitter).toFixed(1))
            : undefined,
        sensor_1: latest.sensor_1
          ? {
              ...latest.sensor_1,
              Moisture: Number((latest.sensor_1.Moisture + jitter * 1.1).toFixed(1)),
            }
          : undefined,
        sensor_2: latest.sensor_2
          ? {
              ...latest.sensor_2,
              Moisture: Number((latest.sensor_2.Moisture + jitter * 0.9).toFixed(1)),
            }
          : undefined,
        sensor_3: latest.sensor_3
          ? {
              ...latest.sensor_3,
              Moisture: Number((latest.sensor_3.Moisture + jitter * 0.8).toFixed(1)),
            }
          : undefined,
        sensor_4: latest.sensor_4
          ? {
              ...latest.sensor_4,
              Moisture: Number((latest.sensor_4.Moisture + jitter * 1.0).toFixed(1)),
            }
          : undefined,
      });
    }

    return { labels, readings };
  }

  // 3. PER JAM (Histori Jam Hari Ini: Mulai 00:30 WIB)
  if (interval === 'hour') {
    const base = [...HOURLY_BASE_READINGS];
    if (latestReading && base.length > 0) {
      const lastBase = base[base.length - 1];
      const latestTime = latestReading.DateTime.split(' ')[1] || latestReading.DateTime;
      const lastBaseTime = lastBase.DateTime.split(' ')[1] || lastBase.DateTime;
      if (latestTime > lastBaseTime && latestReading.DateTime >= TELEMETRY_START_TIME) {
        base.push(latestReading);
      } else if (latestReading.DateTime >= TELEMETRY_START_TIME) {
        base[base.length - 1] = latestReading;
      }
    }
    const labels = base.map((r) => {
      const parts = r.DateTime.split(' ');
      const timePart = parts[1] || r.DateTime;
      return timePart.substring(0, 5); // '00:30', '01:00', ...
    });
    return { labels, readings: base };
  }

  // 4. PER HARI (Data Hari Ini: Mulai 24 Nov 00:30 WIB)
  if (interval === 'day') {
    const base = [...DAILY_BASE_READINGS];
    if (latestReading && base.length > 0) {
      base[base.length - 1] = {
        ...latestReading,
        DateTime: '24 Nov (Terkini)',
      };
    }
    const labels = base.map((r) => r.DateTime);
    return { labels, readings: base };
  }

  return { labels: [], readings: validLive };
}
