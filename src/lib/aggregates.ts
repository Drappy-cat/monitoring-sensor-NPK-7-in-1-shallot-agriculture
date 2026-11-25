import type { Reading, TimeInterval } from './types';

export const TELEMETRY_START_TIME = '2026-11-25 00:00:00';
export const TELEMETRY_START_DATE = '2026-11-25';

const FIREBASE_RTDB_BASE = (
  process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
  'https://agriculture-esp32-2f547-default-rtdb.asia-southeast1.firebasedatabase.app'
).replace(/\/+$/, '');

export interface RemoteSeries {
  minute: Reading[];
  hour: Reading[];
  day: Reading[];
}

function isValidReading(r: unknown): r is Reading {
  return Boolean(
    r &&
      typeof r === 'object' &&
      typeof (r as Reading).DateTime === 'string' &&
      (r as Reading).DateTime >= TELEMETRY_START_TIME
  );
}

/**
 * Fetches the newest N real-time readings for a given date directly from Firebase RTDB.
 */
export async function fetchLatestReadingsSlice(
  date: string,
  limit: number = 60
): Promise<Reading[]> {
  try {
    const url = `${FIREBASE_RTDB_BASE}/test_kalibrasi/readings/${date}.json?orderBy=%22%24key%22&limitToLast=${limit}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = (await res.json()) as Record<string, Reading> | null;
    if (!data || typeof data !== 'object') return [];

    return Object.entries(data)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, val]) => val)
      .filter(isValidReading);
  } catch {
    return [];
  }
}

/**
 * Discovers all available dates >= 2026-11-24 in Firebase RTDB using a tiny shallow query.
 */
export async function fetchAvailableDates(): Promise<string[]> {
  try {
    const url = `${FIREBASE_RTDB_BASE}/test_kalibrasi/readings.json?shallow=true`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [TELEMETRY_START_DATE];
    const data = (await res.json()) as Record<string, boolean> | null;
    if (!data) return [TELEMETRY_START_DATE];

    const dates = Object.keys(data)
      .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d) && d >= TELEMETRY_START_DATE)
      .sort();

    return dates.length > 0 ? dates : [TELEMETRY_START_DATE];
  } catch {
    return [TELEMETRY_START_DATE];
  }
}

/**
 * Fetches 1 genuine reading at or after startKey (up to endKey) for a given date.
 */
async function fetchSampleAtTime(
  date: string,
  startKey: string,
  endKey?: string
): Promise<Reading | null> {
  try {
    const startParam = encodeURIComponent(`"${startKey}"`);
    const endParam = endKey ? `&endAt=${encodeURIComponent(`"${endKey}"`)}` : '';
    const url = `${FIREBASE_RTDB_BASE}/test_kalibrasi/readings/${date}.json?orderBy=%22%24key%22&startAt=${startParam}${endParam}&limitToFirst=1`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = (await res.json()) as Record<string, Reading> | null;
    if (!data || typeof data !== 'object') return null;

    const first = Object.values(data)[0];
    return isValidReading(first) ? first : null;
  } catch {
    return null;
  }
}

/**
 * Fetches 30 real minute-by-minute samples from Firebase leading up to latestDateTime.
 */
export async function fetchMinuteSeriesFromFirebase(
  latestReading: Reading,
  minutes: number = 30
): Promise<Reading[]> {
  if (!latestReading.DateTime) return [];
  const baseMs = new Date(latestReading.DateTime.replace(' ', 'T')).getTime();
  if (Number.isNaN(baseMs)) return [latestReading];

  const slots: { date: string; key: string }[] = [];
  for (let i = minutes - 1; i >= 0; i--) {
    const dt = new Date(baseMs - i * 60 * 1000);
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    const hh = String(dt.getHours()).padStart(2, '0');
    const min = String(dt.getMinutes()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    if (`${dateStr} ${hh}:${min}:00` < TELEMETRY_START_TIME) continue;
    slots.push({ date: dateStr, key: `${hh}-${min}` });
  }

  const results = await Promise.all(
    slots.map((s) => fetchSampleAtTime(s.date, s.key, `${s.key}-59`))
  );

  const collected = results.filter((r): r is Reading => r !== null);
  return dedupeAndSort([...collected, latestReading]);
}

/**
 * Fetches real hourly samples from Firebase starting 2026-11-25 00:00 up to latestReading.
 */
export async function fetchHourlySeriesFromFirebase(
  dates: string[],
  latestReading: Reading | null
): Promise<Reading[]> {
  const latestDt = latestReading?.DateTime || '';
  const latestDate = latestDt.split(' ')[0] || '';
  const latestHour = latestDt ? Number(latestDt.split(' ')[1]?.substring(0, 2) ?? 23) : 23;

  const queries: { date: string; startKey: string; endKey: string }[] = [];

  for (const date of dates) {
    if (date < TELEMETRY_START_DATE) continue;
    const maxHour = date === latestDate ? latestHour : 23;
    for (let h = 0; h <= maxHour; h++) {
      const hh = String(h).padStart(2, '0');
      queries.push({ date, startKey: `${hh}-00`, endKey: `${hh}-59` });
    }
  }

  const results = await Promise.all(
    queries.map((q) => fetchSampleAtTime(q.date, q.startKey, q.endKey))
  );

  const collected = results.filter((r): r is Reading => r !== null);
  if (latestReading && isValidReading(latestReading)) {
    collected.push(latestReading);
  }
  return dedupeAndSort(collected);
}

/**
 * Fetches real multi-hour/daily checkpoints from Firebase starting 2026-11-25 00:00 up to latestReading.
 */
export async function fetchDailySeriesFromFirebase(
  dates: string[],
  latestReading: Reading | null
): Promise<Reading[]> {
  const latestDt = latestReading?.DateTime || '';
  const latestDate = latestDt.split(' ')[0] || '';
  const latestHour = latestDt ? Number(latestDt.split(' ')[1]?.substring(0, 2) ?? 23) : 23;

  const queries: { date: string; startKey: string; endKey: string }[] = [];

  for (const date of dates) {
    if (date < TELEMETRY_START_DATE) continue;
    const hours = [0, 3, 6, 9, 12, 15, 18, 21];
    for (const h of hours) {
      if (date === latestDate && h > latestHour) continue;
      const hh = String(h).padStart(2, '0');
      queries.push({ date, startKey: `${hh}-00`, endKey: `${hh}-59` });
    }
  }

  const results = await Promise.all(
    queries.map((q) => fetchSampleAtTime(q.date, q.startKey, q.endKey))
  );

  const collected = results.filter((r): r is Reading => r !== null);
  if (latestReading && isValidReading(latestReading)) {
    collected.push(latestReading);
  }
  return dedupeAndSort(collected);
}

function dedupeAndSort(items: Reading[]): Reading[] {
  const map = new Map<string, Reading>();
  for (const r of items) {
    if (!isValidReading(r)) continue;
    map.set(r.DateTime, r);
  }
  return Array.from(map.values()).sort((a, b) => a.DateTime.localeCompare(b.DateTime));
}

function formatDayHourLabel(dt: string): string {
  const [datePart, timePart] = dt.split(' ');
  if (!datePart || !timePart) return dt;
  const [, month, day] = datePart.split('-');
  return `${day}/${month} ${timePart.substring(0, 5)}`;
}

function formatDayBadgeLabel(dt: string): string {
  const [datePart, timePart] = dt.split(' ');
  if (!datePart || !timePart) return dt;
  const [, month, day] = datePart.split('-');
  const monthNames: Record<string, string> = {
    '11': 'Nov',
    '12': 'Des',
    '01': 'Jan',
  };
  const mLabel = monthNames[month] || month;
  return `${Number(day)} ${mLabel} ${timePart.substring(0, 5)}`;
}

/**
 * Returns formatted labels and genuine Firebase readings based on the selected interval.
 * ZERO hardcoded mock arrays and ZERO synthetic jitter.
 */
export function getAggregatedReadings(
  interval: TimeInterval,
  liveReadings: Reading[],
  latestReading: Reading | null,
  remoteSeries?: RemoteSeries
): { labels: string[]; readings: Reading[] } {
  const validLive = liveReadings.filter(isValidReading);

  // 1. PER DETIK (Real-time Firebase stream)
  if (interval === 'second') {
    const readings =
      validLive.length > 0
        ? validLive
        : latestReading && isValidReading(latestReading)
        ? [latestReading]
        : [];
    const labels = readings.map((r) => r.DateTime.split(' ')[1] || r.DateTime);
    return { labels, readings };
  }

  // 2. PER MENIT (Last 30 real minutes from Firebase)
  if (interval === 'minute') {
    const merged = dedupeAndSort([
      ...(remoteSeries?.minute || []),
      ...validLive,
      ...(latestReading ? [latestReading] : []),
    ]);

    // Keep one reading (the latest) per YYYY-MM-DD HH:mm bucket
    const minuteMap = new Map<string, Reading>();
    for (const r of merged) {
      const minuteKey = r.DateTime.substring(0, 16); // 'YYYY-MM-DD HH:mm'
      minuteMap.set(minuteKey, r);
    }

    const bucketed = Array.from(minuteMap.values()).slice(-30);
    const labels = bucketed.map((r) => {
      const timePart = r.DateTime.split(' ')[1] || r.DateTime;
      return timePart.substring(0, 5); // 'HH:mm'
    });
    return { labels, readings: bucketed };
  }

  // 3. PER JAM (Real hourly Firebase progression since 2026-11-24 00:30)
  if (interval === 'hour') {
    const merged = dedupeAndSort([
      ...(remoteSeries?.hour || []),
      ...(latestReading ? [latestReading] : []),
    ]);
    const labels = merged.map((r) => formatDayHourLabel(r.DateTime));
    return { labels, readings: merged };
  }

  // 4. PER HARI (Real multi-day Firebase checkpoints since 2026-11-24 00:30)
  if (interval === 'day') {
    const merged = dedupeAndSort([
      ...(remoteSeries?.day || []),
      ...(latestReading ? [latestReading] : []),
    ]);
    const labels = merged.map((r) => formatDayBadgeLabel(r.DateTime));
    return { labels, readings: merged };
  }

  return { labels: [], readings: validLive };
}
