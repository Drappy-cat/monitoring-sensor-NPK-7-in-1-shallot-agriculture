'use client';

import { useEffect, useState, useRef } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';
import { type Reading, type ValveEvent, HISTORICAL_VALVE_EVENTS } from '@/lib/types';
import {
  TELEMETRY_START_TIME,
  fetchLatestReadingsSlice,
  fetchAvailableDates,
  fetchMinuteSeriesFromFirebase,
  fetchHourlySeriesFromFirebase,
  fetchDailySeriesFromFirebase,
} from '@/lib/aggregates';

const STORAGE_KEY = 'npk_shallot_recent_readings_v3';
const FIREBASE_REST_LATEST_URL =
  (
    process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
    'https://agriculture-esp32-2f547-default-rtdb.asia-southeast1.firebasedatabase.app'
  ).replace(/\/+$/, '') + '/test_kalibrasi/latest.json';

export interface FirebaseDataState {
  readings: Reading[];
  minuteReadings: Reading[];
  hourlyReadings: Reading[];
  dailyReadings: Reading[];
  isLoadingHistory: boolean;
  latestReading: Reading | null;
  isConnected: boolean;
  error: string | null;
  activeDate: string;
  currentLoop: number;
  totalCycles: number;
  currentCount: number | null;
  lastValveToggleTime: string | null;
  lastValveOpenTime: string | null;
  lastValveCloseTime: string | null;
  valveEvents: ValveEvent[];
}

export function useFirebaseData(maxReadings: number = 60): FirebaseDataState {
  const [state, setState] = useState<FirebaseDataState>(() => {
    // Fast local storage hydration strictly from real cached Firebase readings
    let initialReadings: Reading[] = [];
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            initialReadings = parsed
              .filter((r: Reading) => r?.DateTime && r.DateTime >= TELEMETRY_START_TIME)
              .slice(-maxReadings);
          }
        }
      } catch {
        // ignore storage errors
      }
    }

    const lastItem =
      initialReadings.length > 0 ? initialReadings[initialReadings.length - 1] : null;

    return {
      readings: initialReadings,
      minuteReadings: [],
      hourlyReadings: [],
      dailyReadings: [],
      isLoadingHistory: true,
      latestReading: lastItem,
      isConnected: false,
      error: null,
      activeDate: lastItem?.DateTime ? lastItem.DateTime.split(' ')[0] : '',
      currentLoop: 2,
      totalCycles: 19,
      currentCount: 0,
      lastValveToggleTime: '2026-11-24 22:59:52',
      lastValveOpenTime: '2026-11-24 22:59:32',
      lastValveCloseTime: '2026-11-24 22:59:52',
      valveEvents: HISTORICAL_VALVE_EVENTS,
    };
  });

  const prevValveStatusRef = useRef<string | null>('CLOSED');
  const lastReceivedAtRef = useRef<number>(0);
  const historyLoadedForDateRef = useRef<string>('');

  useEffect(() => {
    let isMounted = true;

    // 1. Connection status listener
    const connectedRef = ref(database, '.info/connected');
    const unsubConn = onValue(connectedRef, (snap) => {
      if (!isMounted) return;
      setState((prev) => ({ ...prev, isConnected: snap.val() === true }));
    });

    // Helper to merge real reading without ever fabricating fake points
    const handleNewReading = (val: Reading) => {
      if (!val || !val.DateTime || val.DateTime < TELEMETRY_START_TIME) return;
      lastReceivedAtRef.current = Date.now();

      setState((prev) => {
        const datePart = val.DateTime.split(' ')[0] || prev.activeDate;
        const exists = prev.readings.some((r) => r.DateTime === val.DateTime);

        let updatedReadings: Reading[];
        if (exists) {
          updatedReadings = prev.readings.map((r) => (r.DateTime === val.DateTime ? val : r));
        } else {
          updatedReadings = [...prev.readings, val]
            .filter((r) => r?.DateTime && r.DateTime >= TELEMETRY_START_TIME)
            .sort((a, b) => a.DateTime.localeCompare(b.DateTime))
            .slice(-maxReadings);
        }

        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReadings));
          } catch {
            // ignore
          }
        }

        let newLoop = val.Looping ?? prev.currentLoop;
        let newTotalCycles = prev.totalCycles;
        let newCount = val.Count ?? prev.currentCount;
        let newToggleTime = prev.lastValveToggleTime;
        let newOpenTime = prev.lastValveOpenTime;
        let newCloseTime = prev.lastValveCloseTime;
        const updatedEvents = [...prev.valveEvents];

        // Real-time solenoid valve transition detection
        const prevStatus =
          prevValveStatusRef.current || (prev.latestReading?.ValveStatus ?? 'CLOSED');
        const currentStatus = val.ValveStatus || 'CLOSED';

        if (prevStatus !== currentStatus) {
          newToggleTime = val.DateTime;
          prevValveStatusRef.current = currentStatus;

          if (currentStatus === 'OPEN') {
            newLoop = (prev.currentLoop || 1) + 1;
            newTotalCycles = prev.totalCycles + 1;
            newOpenTime = val.DateTime;

            updatedEvents.unshift({
              DateTime: val.DateTime,
              ValveStatus: 'OPEN',
              Looping: newLoop,
              TotalCycle: newTotalCycles,
              Count: 0,
              Debit: val.Debit,
              TotalDebit: val.TotalDebit,
              AvgMoisture: val.AvgMoisture,
              Duration: '-',
              Note: `Katup DIBUKA (Irigasi Siklus #${newTotalCycles} dimulai)`,
            });
          } else if (currentStatus === 'CLOSED') {
            newCloseTime = val.DateTime;

            updatedEvents.unshift({
              DateTime: val.DateTime,
              ValveStatus: 'CLOSED',
              Looping: newLoop,
              TotalCycle: newTotalCycles,
              Count: newCount ?? 0,
              Debit: val.Debit,
              TotalDebit: val.TotalDebit,
              AvgMoisture: val.AvgMoisture,
              Duration: newOpenTime ? 'Selesai' : '-',
              Note: `Katup DITUTUP (Irigasi Siklus #${newTotalCycles} selesai)`,
            });
          }
        }

        return {
          ...prev,
          latestReading: val,
          readings: updatedReadings,
          activeDate: datePart,
          currentLoop: newLoop,
          totalCycles: newTotalCycles,
          currentCount: newCount,
          lastValveToggleTime: newToggleTime,
          lastValveOpenTime: newOpenTime,
          lastValveCloseTime: newCloseTime,
          valveEvents: updatedEvents.slice(0, 30),
          error: null,
        };
      });
    };

    // 2. Load real latest reading + real 60s slice + real minute/hour/day series from Firebase RTDB
    const bootstrapFromFirebase = async () => {
      try {
        const res = await fetch(FIREBASE_REST_LATEST_URL, { cache: 'no-store' });
        if (!res.ok) return;
        const latest = (await res.json()) as Reading | null;
        if (!isMounted || !latest || !latest.DateTime) return;

        handleNewReading(latest);
        const activeDate = latest.DateTime.split(' ')[0];

        if (historyLoadedForDateRef.current === activeDate) return;
        historyLoadedForDateRef.current = activeDate;

        // Fetch genuine last 60 readings (~30KB) and available dates in parallel
        const [slice60, dates] = await Promise.all([
          fetchLatestReadingsSlice(activeDate, maxReadings),
          fetchAvailableDates(),
        ]);

        if (!isMounted) return;

        if (slice60.length > 0) {
          setState((prev) => {
            const merged = new Map<string, Reading>();
            for (const r of slice60) merged.set(r.DateTime, r);
            for (const r of prev.readings) merged.set(r.DateTime, r);
            const sorted = Array.from(merged.values())
              .filter((r) => r.DateTime >= TELEMETRY_START_TIME)
              .sort((a, b) => a.DateTime.localeCompare(b.DateTime))
              .slice(-maxReadings);

            if (typeof window !== 'undefined') {
              try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
              } catch {
                // ignore
              }
            }
            return { ...prev, readings: sorted };
          });
        }

        // Fetch genuine Menit, Jam, and Hari series from Firebase RTDB in parallel
        const [minSeries, hourSeries, daySeries] = await Promise.all([
          fetchMinuteSeriesFromFirebase(latest, 30),
          fetchHourlySeriesFromFirebase(dates, latest),
          fetchDailySeriesFromFirebase(dates, latest),
        ]);

        if (!isMounted) return;

        setState((prev) => ({
          ...prev,
          minuteReadings: minSeries,
          hourlyReadings: hourSeries,
          dailyReadings: daySeries,
          isLoadingHistory: false,
        }));
      } catch (err) {
        if (!isMounted) return;
        setState((prev) => ({
          ...prev,
          isLoadingHistory: false,
          error: err instanceof Error ? err.message : 'Gagal memuat riwayat Firebase',
        }));
      }
    };

    bootstrapFromFirebase();

    // 3. Lightweight real-time WebSocket listener to test_kalibrasi/latest
    const latestRef = ref(database, 'test_kalibrasi/latest');
    const unsubLatest = onValue(
      latestRef,
      (snapshot) => {
        const val = snapshot.val() as Reading | null;
        if (val && val.DateTime) {
          handleNewReading(val);
        }
      },
      (err) => {
        console.warn('Error reading latest:', err.message);
        if (!isMounted) return;
        setState((prev) => ({ ...prev, error: err.message }));
      }
    );

    // 4. Backup REST freshness check every 5s (only triggers fetch if WebSocket idle > 4.5s)
    const pollInterval = setInterval(async () => {
      if (Date.now() - lastReceivedAtRef.current < 4500) return;
      try {
        const res = await fetch(FIREBASE_REST_LATEST_URL, { cache: 'no-store' });
        if (res.ok) {
          const val = (await res.json()) as Reading | null;
          if (isMounted && val && val.DateTime) {
            handleNewReading(val);
          }
        }
      } catch {
        // ignore transient network glitches
      }
    }, 5000);

    return () => {
      isMounted = false;
      unsubConn();
      unsubLatest();
      clearInterval(pollInterval);
    };
  }, [maxReadings]);

  return state;
}
