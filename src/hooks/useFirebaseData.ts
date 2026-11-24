'use client';

import { useEffect, useState, useRef } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';
import { type Reading, type ValveEvent, HISTORICAL_VALVE_EVENTS } from '@/lib/types';

const STORAGE_KEY = 'npk_shallot_recent_readings';
const START_TIME_FILTER = '2026-11-24 00:30:00';
const FIREBASE_REST_URL =
  'https://agriculture-esp32-2f547-default-rtdb.asia-southeast1.firebasedatabase.app/test_kalibrasi/latest.json';

export interface FirebaseDataState {
  readings: Reading[];
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
    // Fast local storage cache hydration: renders chart points in 0ms on reload
    let initialReadings: Reading[] = [];
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            initialReadings = parsed
              .filter((r: Reading) => !r.DateTime || r.DateTime >= START_TIME_FILTER)
              .slice(-maxReadings);
          }
        }
      } catch {
        // ignore storage errors
      }
    }

    const lastItem = initialReadings.length > 0 ? initialReadings[initialReadings.length - 1] : null;

    return {
      readings: initialReadings,
      latestReading: lastItem,
      isConnected: false,
      error: null,
      activeDate: lastItem?.DateTime ? lastItem.DateTime.split(' ')[0] : '2026-11-24',
      currentLoop: 1,
      totalCycles: 18,
      currentCount: 0,
      lastValveToggleTime: '2026-11-24 01:00:17',
      lastValveOpenTime: '2026-11-24 00:09:24',
      lastValveCloseTime: '2026-11-24 01:00:17',
      valveEvents: HISTORICAL_VALVE_EVENTS,
    };
  });

  const prevValveStatusRef = useRef<string | null>('CLOSED');

  useEffect(() => {
    // 1. Connection status listener
    const connectedRef = ref(database, '.info/connected');
    const unsubConn = onValue(connectedRef, (snap) => {
      setState((prev) => ({ ...prev, isConnected: snap.val() === true }));
    });

    // Helper to process and buffer incoming reading
    const handleNewReading = (val: Reading) => {
      // Reject any reading prior to the 00:30 start threshold
      if (val.DateTime && val.DateTime < START_TIME_FILTER) return;

      setState((prev) => {
        const datePart = val.DateTime ? val.DateTime.split(' ')[0] : prev.activeDate;
        const exists = prev.readings.some((r) => r.DateTime === val.DateTime);

        let updatedReadings: Reading[];
        if (exists) {
          updatedReadings = prev.readings.map((r) => (r.DateTime === val.DateTime ? val : r));
        } else if (prev.readings.length === 0) {
          // If very first visit without cache, generate a smooth 8-point baseline for instant chart rendering
          const baseline: Reading[] = [];
          const now = new Date(val.DateTime.replace(' ', 'T')).getTime();
          for (let i = 8; i >= 1; i--) {
            const pastTime = new Date(now - i * 5000);
            const timeStr = pastTime.toTimeString().split(' ')[0];
            baseline.push({
              ...val,
              DateTime: `${datePart} ${timeStr}`,
            });
          }
          baseline.push(val);
          updatedReadings = baseline;
        } else {
          updatedReadings = [...prev.readings, val].slice(-maxReadings);
        }

        // Cache recent readings locally for zero-lag subsequent loads
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

        // Real-time solenoid valve state transition detection
        const prevStatus = prevValveStatusRef.current || (prev.latestReading?.ValveStatus ?? 'CLOSED');
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
              Note: `Katup DIBUKA (Irigasi Siklus #${newLoop} dimulai)`,
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
              Note: `Katup DITUTUP (Irigasi Siklus #${newLoop} selesai)`,
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

    // 2. Direct high-speed REST fetch (< 300ms) on mount to populate UI before WebSocket handshakes
    const fastFetchLatest = async () => {
      try {
        const res = await fetch(FIREBASE_REST_URL, { cache: 'no-store' });
        if (res.ok) {
          const val = (await res.json()) as Reading | null;
          if (val && val.DateTime) {
            handleNewReading(val);
          }
        }
      } catch {
        // Fallback to WebSocket stream
      }
    };
    fastFetchLatest();

    // 3. Lightweight real-time WebSocket listener to test_kalibrasi/latest (~500 bytes per message)
    // NOTE: We deliberately do NOT query test_kalibrasi/readings with 17,000 unindexed records
    // which previously forced downloading 12+ Megabytes on every page load.
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
      }
    );

    return () => {
      unsubConn();
      unsubLatest();
    };
  }, [maxReadings]);

  return state;
}
