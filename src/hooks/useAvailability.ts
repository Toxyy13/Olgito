import { useEffect, useMemo, useState } from 'react';
import { useAppAlert } from '../context/AlertContext';
import { getEffectiveDayHours } from '../api/workingHours';
import { getBusyRangesOnce, type AvailabilityRange } from '../api/availability';
import { computeAvailableStartTimes, generateSlotStarts, addMinutesToTime, rangesOverlap, todayISO } from '../utils/time';
import { SLOT_MINUTES, type DayHours } from '../types';

export interface DaySlot {
  start: string;
  busy: boolean;
}

// Učitava radno vreme i zauzeća za izabrani datum/broj osoba, i računa punu
// mrežu 30-min pozicija (ne samo validne polazne tačke) — deljeno između
// klijentskog i adminskog "novi termin" ekrana.
export function useAvailability(selectedDate: string, peopleCount: number) {
  const { alert } = useAppAlert();
  const [dayHours, setDayHours] = useState<DayHours | null>(null);
  const [busyRanges, setBusyRanges] = useState<AvailabilityRange[]>([]);
  const [availableStarts, setAvailableStarts] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const hours = await getEffectiveDayHours(selectedDate);
        if (cancelled) return;
        setDayHours(hours);
        if (hours.closed) {
          setBusyRanges([]);
          setAvailableStarts([]);
          return;
        }
        const busy = await getBusyRangesOnce(selectedDate);
        if (cancelled) return;
        setBusyRanges(busy);
        let starts = computeAvailableStartTimes(hours.start, hours.end, busy, peopleCount);
        if (selectedDate === todayISO()) {
          const now = new Date();
          const nowHHmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
          starts = starts.filter((t) => t > nowHHmm);
        }
        setAvailableStarts(starts);
      } catch {
        if (!cancelled) alert('Greška', 'Nije moguće učitati slobodne termine. Pokušaj ponovo.');
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, peopleCount]);

  const allSlots = useMemo<DaySlot[]>(() => {
    if (!dayHours || dayHours.closed) return [];
    return generateSlotStarts(dayHours.start, dayHours.end).map((start) => {
      const end = addMinutesToTime(start, SLOT_MINUTES);
      const busy = busyRanges.some((r) => rangesOverlap(r, { startTime: start, endTime: end }));
      return { start, busy };
    });
  }, [dayHours, busyRanges]);

  return { dayHours, availableStarts, allSlots };
}
