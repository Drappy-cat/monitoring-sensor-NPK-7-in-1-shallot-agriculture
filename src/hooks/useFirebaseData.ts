'use client';

import { useEffect, useState, useRef } from 'react';
import { ref, onValue, query, limitToLast, orderByKey } from 'firebase/database';
import { database } from '@/lib/firebase';
import type { Reading, ValveEvent } from '@/lib/types';

interface FirebaseDataState {
  readings: Reading[];
  latestReading: Reading | null;
  isConnected: boolean;
  error: string | null;
  activeDate: string;
  currentLoop: number | null;
  currentCount: number | null;
  lastValveToggleTime: string | null;
  valveEvents: ValveEvent[];
}

export function useFirebaseData(maxReadings: number = 60): FirebaseDataState {
  const [state, setState] = useState<FirebaseDataState>({
    readings: [],
    latestReading: null,
    isConnected: false,
    error: null,
    activeDate: '',
    currentLoop: null,
    currentCount: null,
    lastValveToggleTime: null,
    valveEvents: [],
  });

  const activeDateRef = useRef<string>('');
  const readingsUnsubRef = useRef<(() => void) | null>(null);

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
          const events: ValveEvent[] = [];
          let prevValve: string | null = null;
          let latestKnownLoop: number | null = null;
          let latestKnownCount: number | null = null;
          let latestToggleTime: string | null = null;

          for (const k of timeKeys) {
            const rawItem = data[k] as Reading;
            if (rawItem && rawItem.DateTime) {
              const { loop, count } = extractLoopAndCount(rawItem, k);
              const item: Reading = {
                ...rawItem,
                Looping: loop,
                Count: count,
              };

              if (loop !== undefined && loop !== null) {
                latestKnownLoop = loop;
              }
              if (count !== undefined && count !== null) {
                latestKnownCount = count;
              }

              // Detect valve status transitions or loop events
              if (item.ValveStatus) {
                if (prevValve !== null && item.ValveStatus !== prevValve) {
                  latestToggleTime = item.DateTime;
                  events.unshift({
                    DateTime: item.DateTime,
                    ValveStatus: item.ValveStatus,
                    Looping: latestKnownLoop ?? item.Looping,
                    Count: latestKnownCount ?? item.Count,
                    Debit: item.Debit,
                    TotalDebit: item.TotalDebit,
                    AvgMoisture: item.AvgMoisture,
                  });
                } else if (item.Looping !== undefined && item.Looping !== null && events.length === 0) {
                  events.push({
                    DateTime: item.DateTime,
                    ValveStatus: item.ValveStatus,
                    Looping: item.Looping,
                    Count: item.Count,
                    Debit: item.Debit,
                    TotalDebit: item.TotalDebit,
                    AvgMoisture: item.AvgMoisture,
                  });
                }
                prevValve = item.ValveStatus;
              }

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
            const finalLoop =
              finalLatest?.Looping ?? latestKnownLoop ?? prev.currentLoop;
            const finalCount =
              finalLatest?.Count ?? latestKnownCount ?? prev.currentCount;

            return {
              ...prev,
              readings: items,
              latestReading: finalLatest,
              currentLoop: finalLoop,
              currentCount: finalCount,
              lastValveToggleTime: latestToggleTime || prev.lastValveToggleTime,
              valveEvents: events.length > 0 ? events.slice(0, 20) : prev.valveEvents,
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

            const loopVal = val.Looping ?? prev.currentLoop;
            const countVal = val.Count ?? prev.currentCount;

            // Track if valve status changed in latest
            let toggleTime = prev.lastValveToggleTime;
            let updatedEvents = [...prev.valveEvents];
            if (
              prev.latestReading &&
              val.ValveStatus &&
              prev.latestReading.ValveStatus &&
              val.ValveStatus !== prev.latestReading.ValveStatus
            ) {
              toggleTime = val.DateTime;
              updatedEvents.unshift({
                DateTime: val.DateTime,
                ValveStatus: val.ValveStatus,
                Looping: loopVal ?? undefined,
                Count: countVal ?? undefined,
                Debit: val.Debit,
                TotalDebit: val.TotalDebit,
                AvgMoisture: val.AvgMoisture,
              });
            }

            return {
              ...prev,
              latestReading: val,
              readings: updated,
              currentLoop: loopVal,
              currentCount: countVal,
              lastValveToggleTime: toggleTime || (val.ValveStatus ? val.DateTime : null),
              valveEvents: updatedEvents.slice(0, 20),
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
