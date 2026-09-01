import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { db } from '../db';
import { requireAuth, requireAdmin } from '../auth/middleware';

export const workingHoursRouter = Router();
workingHoursRouter.use(requireAuth);

interface WeeklyRow {
  day: string;
  closed: number;
  start: string;
  end: string;
}
interface OverrideRow {
  date: string;
  closed: number;
  start: string | null;
  end: string | null;
}

const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

workingHoursRouter.get('/weekly', (_req, res) => {
  const rows = db.prepare('SELECT * FROM working_hours_weekly').all() as WeeklyRow[];
  const weekly: Record<string, { closed: boolean; start: string; end: string }> = {};
  for (const r of rows) weekly[r.day] = { closed: !!r.closed, start: r.start, end: r.end };
  res.json({ weekly });
});

workingHoursRouter.put('/weekly/:day', requireAdmin, (req, res) => {
  const { closed, start, end } = req.body ?? {};
  db.prepare('UPDATE working_hours_weekly SET closed = ?, start = ?, end = ? WHERE day = ?').run(
    closed ? 1 : 0,
    start,
    end,
    req.params.day
  );
  res.json({ ok: true });
});

workingHoursRouter.get('/effective', (req, res) => {
  const date = String(req.query.date ?? '');
  if (!date) return res.status(400).json({ error: 'Nedostaje datum.' });

  const override = db.prepare('SELECT * FROM working_hours_overrides WHERE date = ?').get(date) as OverrideRow | undefined;
  if (override) {
    return res.json({
      hours: { closed: !!override.closed, start: override.start ?? '09:00', end: override.end ?? '17:00' },
    });
  }

  const [y, m, d] = date.split('-').map(Number);
  const dayKey = WEEKDAY_KEYS[new Date(y, m - 1, d).getDay()];
  const weekly = db.prepare('SELECT * FROM working_hours_weekly WHERE day = ?').get(dayKey) as WeeklyRow | undefined;
  res.json({ hours: weekly ? { closed: !!weekly.closed, start: weekly.start, end: weekly.end } : { closed: true, start: '09:00', end: '17:00' } });
});

// Vraća listu datuma u opsegu kad Olgica ne radi (ceo dan) — kombinuje
// izuzetke po datumu i nedeljni raspored — da bi kalendar mogao odjednom da
// oboji ceo prikazani mesec, umesto da se to proverava dan po dan.
workingHoursRouter.get('/closed-dates', (req, res) => {
  const from = String(req.query.from ?? '');
  const to = String(req.query.to ?? '');
  if (!from || !to) return res.status(400).json({ error: 'Nedostaju datumi.' });

  const weeklyRows = db.prepare('SELECT * FROM working_hours_weekly').all() as WeeklyRow[];
  const weeklyByDay = new Map(weeklyRows.map((r) => [r.day, r]));

  const overrides = db
    .prepare('SELECT date, closed FROM working_hours_overrides WHERE date >= ? AND date <= ?')
    .all(from, to) as { date: string; closed: number }[];
  const overrideByDate = new Map(overrides.map((o) => [o.date, !!o.closed]));

  const [fy, fm, fd] = from.split('-').map(Number);
  const [ty, tm, td] = to.split('-').map(Number);
  const cursor = new Date(fy, fm - 1, fd);
  const end = new Date(ty, tm - 1, td);
  const closedDates: string[] = [];

  while (cursor <= end) {
    const iso = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
    if (overrideByDate.has(iso)) {
      if (overrideByDate.get(iso)) closedDates.push(iso);
    } else if (weeklyByDay.get(WEEKDAY_KEYS[cursor.getDay()])?.closed) {
      closedDates.push(iso);
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  res.json({ closedDates });
});

workingHoursRouter.get('/overrides/:date', (req, res) => {
  const row = db.prepare('SELECT * FROM working_hours_overrides WHERE date = ?').get(req.params.date) as OverrideRow | undefined;
  res.json({ override: row ? { date: row.date, closed: !!row.closed, start: row.start, end: row.end } : null });
});

workingHoursRouter.put('/overrides/:date', requireAdmin, (req, res) => {
  const { closed, start, end } = req.body ?? {};
  db.prepare(
    `INSERT INTO working_hours_overrides (date, closed, start, end) VALUES (?, ?, ?, ?)
     ON CONFLICT(date) DO UPDATE SET closed = excluded.closed, start = excluded.start, end = excluded.end`
  ).run(req.params.date, closed ? 1 : 0, start ?? null, end ?? null);
  res.json({ ok: true });
});

workingHoursRouter.delete('/overrides/:date', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM working_hours_overrides WHERE date = ?').run(req.params.date);
  res.json({ ok: true });
});

// --- pauze u toku dana ---
workingHoursRouter.get('/blocked-slots', (req, res) => {
  const date = String(req.query.date ?? '');
  const rows = db.prepare('SELECT * FROM blocked_slots WHERE date = ?').all(date);
  res.json({ blockedSlots: rows });
});

workingHoursRouter.post('/blocked-slots', requireAdmin, (req, res) => {
  const { date, startTime, endTime, reason } = req.body ?? {};
  const id = randomUUID();
  db.prepare('INSERT INTO blocked_slots (id, date, startTime, endTime, reason) VALUES (?, ?, ?, ?, ?)').run(
    id,
    date,
    startTime,
    endTime,
    reason ?? null
  );
  res.json({ id });
});

workingHoursRouter.delete('/blocked-slots/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM blocked_slots WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});
