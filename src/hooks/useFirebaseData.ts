'use client';

import { useEffect, useState, useRef } from 'react';
import { ref, onValue, query, limitToLast, orderByKey } from 'firebase/database';
import { database } from '@/lib/firebase';
import { type Reading, type ValveEvent, HISTORICAL_VALVE_EVENTS } from '@/lib/types';

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
  const [state, setState] = useState<FirebaseDataState>({
    readings: [],
    latestReading: null,
    isConnected: false,
    error: null,
    activeDate: '',
    currentLoop: 1,
    totalCycles: 18,
    currentCount: 0,
    lastValveToggleTime: '2026-11-24 01:00:17',
    lastValveOpenTime: '2026-11-24 00:09:24',
    lastValveCloseTime: '2026-11-24 01:00:17',
    valveEvents: HISTORICAL_VALVE_EVENTS,
  });

  const activeDateRef = useRef<string>('');
  const readingsUnsubRef = useRef<(() => void) | null>(null);
  const prevValveStatusRef = useRef<string | null>('CLOSED');

  useEffect(() => {
    // 1. Connection status listener
    const connectedRef = ref(database, '.info/connected');
    const unsubConn = onValue(connectedRef, (snap) => {
      setState((prev) => ({ ...prev, isConnected: snap.val() === true }));
    });

    // Helper to extract loop info from reading or key
    const extractLoopAndCount = (item: Reading, keyStr: string) => {
      let loop = item.Looping;
      let count = item.Count;

      if (keyStr && keyStr.includes('_L')) {
        const match = keyStr.match(/_L(\d+)(?:_C(\d+))?/i);
        if (match) {
          if (loop === undefined) loop = parseInt(match[1], 10);
          if (count === undefined && match[2]) count = parseInt(match[2], 10);
        }
      }

      return { loop, count };
    };

    // Helper to listen to readings for a specific date
    const subscribeToDate = (dateStr: string) => {
      if (activeDateRef.current === dateStr && readingsUnsubRef.current) {
        return;
      }

      if (readingsUnsubRef.current) {
        readingsUnsubRef.current();
        readingsUnsubRef.current = null;
      }

      activeDateRef.current = dateStr;
      setState((prev) => ({ ...prev, activeDate: dateStr }));

      const dayRef = ref(database, `test_kalibrasi/readings/${dateStr}`);
      const dayQuery = query(dayRef, orderByKey(), limitToLast(maxReadings));

      const unsub = onValue(
        dayQuery,
        (snapshot) => {
          const data = snapshot.val();
          if (!data) return;

          const timeKeys = Object.keys(data).sort();
          const items: Reading[] = [];

          for (const k of timeKeys) {
            const rawItem = data[k] as Reading;
            if (rawItem && rawItem.DateTime) {
              const { loop, count } = extractLoopAndCount(rawItem, k);
              const item: Reading = {
                ...rawItem,
                Looping: loop,
                Count: count,
              };
              items.push(item);
            }
          }

          items.sort(
            (a, b) =>
              new Date(a.DateTime.replace(' ', 'T')).getTime() -
              new Date(b.DateTime.replace(' ', 'T')).getTime()
          );

          setState((prev) => {
            const finalLatest = prev.latestReading || items[items.length - 1] || null;
            return {
              ...prev,
              readings: items,
              latestReading: finalLatest,
              error: null,
            };
          });
        },
        (err) => {
          console.error('Error fetching daily readings:', err);
          setState((prev) => ({ ...prev, error: err.message }));
        }
      );

      readingsUnsubRef.current = unsub;
    };

    // 2. Direct listener to test_kalibrasi/latest for instant real-time data
    const latestRef = ref(database, 'test_kalibrasi/latest');
    const unsubLatest = onValue(
      latestRef,
      (snapshot) => {
        const val = snapshot.val() as Reading | null;
        if (val && val.DateTime) {
          const datePart = val.DateTime.split(' ')[0];
          if (datePart && datePart !== activeDateRef.current) {
            subscribeToDate(datePart);
          }

          setState((prev) => {
            const exists = prev.readings.some((r) => r.DateTime === val.DateTime);
            const updated = exists
              ? prev.readings.map((r) => (r.DateTime === val.DateTime ? val : r))
              : [...prev.readings, val].slice(-maxReadings);

            let newLoop = val.Looping ?? prev.currentLoop;
            let newTotalCycles = prev.totalCycles;
            let newCount = val.Count ?? prev.currentCount;
            let newToggleTime = prev.lastValveToggleTime;
            let newOpenTime = prev.lastValveOpenTime;
            let newCloseTime = prev.lastValveCloseTime;
            const updatedEvents = [...prev.valveEvents];

            // Deteksi perubahan transisi status katup secara realtime
            const prevStatus = prevValveStatusRef.current || (prev.latestReading?.ValveStatus ?? 'CLOSED');
            const currentStatus = val.ValveStatus || 'CLOSED';

            if (prevStatus !== currentStatus) {
              newToggleTime = val.DateTime;
              prevValveStatusRef.current = currentStatus;

              if (currentStatus === 'OPEN') {
                // Siklus baru dimulai
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
                // Siklus selesai / katup ditutup
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
                  Duration: newOpenTime ? `Selesai` : '-',
                  Note: `Katup DITUTUP (Irigasi Siklus #${newLoop} selesai)`,
                });
              }
            }

            return {
              ...prev,
              latestReading: val,
              readings: updated,
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
        }
      },
      (err) => {
        console.warn('Error reading latest:', err.message);
      }
    );

    // Initial fallback if latest is delayed: get latest date node
    const dateFinderRef = query(ref(database, 'test_kalibrasi/readings'), orderByKey(), limitToLast(1));
    const unsubDateFinder = onValue(dateFinderRef, (snapshot) => {
      const data = snapshot.val();
      if (data && !activeDateRef.current) {
        const dates = Object.keys(data);
        if (dates.length > 0) {
          subscribeToDate(dates[dates.length - 1]);
        }
      }
    });

    return () => {
      unsubConn();
      unsubLatest();
      unsubDateFinder();
      if (readingsUnsubRef.current) {
        readingsUnsubRef.current();
      }
    };
  }, [maxReadings]);

  return state;
}
