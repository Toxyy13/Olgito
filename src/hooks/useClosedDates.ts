import { useEffect, useState } from 'react';
import { getClosedDatesForRange } from '../api/workingHours';

function monthRange(dateISO: string): { from: string; to: string } {
  const [y, m] = dateISO.split('-').map(Number);
  const from = `${y}-${String(m).padStart(2, '0')}-01`;
  const lastDay = new Date(y, m, 0).getDate();
  const to = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { from, to };
}

// Datumi kad Olgica ne radi ceo dan, za mesec u kom se nalazi monthAnchorISO —
// osvežava se kad se promeni godina/mesec, ili ručno preko refreshKey (npr.
// posle čuvanja/uklanjanja izuzetka, da se boja odmah ažurira).
export function useClosedDatesForMonth(monthAnchorISO: string, refreshKey: number = 0): string[] {
  const [closedDates, setClosedDates] = useState<string[]>([]);
  const monthKey = monthAnchorISO.slice(0, 7);

  useEffect(() => {
    let cancelled = false;
    const { from, to } = monthRange(monthAnchorISO);
    getClosedDatesForRange(from, to)
      .then((dates) => {
        if (!cancelled) setClosedDates(dates);
      })
      .catch(() => {
        if (!cancelled) setClosedDates([]);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthKey, refreshKey]);

  return closedDates;
}
