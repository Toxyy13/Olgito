import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { db } from '../db';
import { requireAuth, requireAdmin, requireApprovedClient } from '../auth/middleware';
import { addMinutesToTime, rangesOverlap } from '../time';
import { sendExpoPush, getAdminTokens, getUserToken } from '../push';

export const appointmentsRouter = Router();
appointmentsRouter.use(requireAuth);

interface AppointmentRow {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  serviceIds: string;
  serviceNames: string;
  peopleCount: number;
  date: string;
  startTime: string;
  endTime: string;
  startAtMillis: number;
  status: string;
  note: string | null;
  reminderSentAt: number | null;
  createdAt: number;
  cancelledBy: string | null;
}

function toAppointment(row: AppointmentRow) {
  return { ...row, serviceIds: JSON.parse(row.serviceIds), serviceNames: JSON.parse(row.serviceNames) };
}

// Zauzeti opsezi za dan — bez imena, za klijentski prikaz kalendara.
appointmentsRouter.get('/availability', (req, res) => {
  const date = String(req.query.date ?? '');
  const rows = db
    .prepare("SELECT id, startTime, endTime FROM appointments WHERE date = ? AND status != 'otkazano'")
    .all(date) as Array<{ id: string; startTime: string; endTime: string }>;
  res.json({ busyRanges: rows.map((r) => ({ appointmentId: r.id, startTime: r.startTime, endTime: r.endTime })) });
});

// Admin: svi termini za dan (date=), za opseg datuma (from=&to=, npr. za nedeljnu/mesečnu
// zaradu), ili cela istorija jednog klijenta (clientId=), sa imenima.
appointmentsRouter.get('/', requireAdmin, (req, res) => {
  if (req.query.clientId) {
    const rows = db
      .prepare('SELECT * FROM appointments WHERE clientId = ? ORDER BY date DESC, startTime DESC')
      .all(String(req.query.clientId)) as AppointmentRow[];
    return res.json({ appointments: rows.map(toAppointment) });
  }
  if (req.query.from && req.query.to) {
    const rows = db
      .prepare('SELECT * FROM appointments WHERE date >= ? AND date <= ? ORDER BY date ASC, startTime ASC')
      .all(String(req.query.from), String(req.query.to)) as AppointmentRow[];
    return res.json({ appointments: rows.map(toAppointment) });
  }
  const date = String(req.query.date ?? '');
  const rows = db.prepare('SELECT * FROM appointments WHERE date = ? ORDER BY startTime ASC').all(date) as AppointmentRow[];
  res.json({ appointments: rows.map(toAppointment) });
});

appointmentsRouter.get('/mine', (req, res) => {
  const rows = db
    .prepare('SELECT * FROM appointments WHERE clientId = ? ORDER BY date DESC, startTime DESC')
    .all(req.user!.id) as AppointmentRow[];
  res.json({ appointments: rows.map(toAppointment) });
});

appointmentsRouter.post('/', requireApprovedClient, async (req, res) => {
  const { serviceIds, serviceNames, peopleCount, date, startTime, note } = req.body ?? {};
  const people = Number(peopleCount);
  if (!Array.isArray(serviceIds) || serviceIds.length === 0) {
    return res.status(400).json({ error: 'Izaberi bar jednu uslugu.' });
  }
  if (!people || people < 1 || people > 6) return res.status(400).json({ error: 'Neispravan broj osoba.' });
  if (typeof date !== 'string' || typeof startTime !== 'string') {
    return res.status(400).json({ error: 'Nedostaje datum ili vreme.' });
  }

  const endTime = addMinutesToTime(startTime, people * 30);

  const run = db.transaction(() => {
    const existing = db
      .prepare("SELECT startTime, endTime FROM appointments WHERE date = ? AND status != 'otkazano'")
      .all(date) as Array<{ startTime: string; endTime: string }>;
    const overlap = existing.some((e) => rangesOverlap(e.startTime, e.endTime, startTime, endTime));
    if (overlap) throw new Error('SLOT_TAKEN');

    const id = randomUUID();
    const [y, m, d] = date.split('-').map(Number);
    const [h, min] = startTime.split(':').map(Number);
    const startAtMillis = new Date(y, m - 1, d, h, min).getTime();

    db.prepare(
      `INSERT INTO appointments
        (id, clientId, clientName, clientPhone, serviceIds, serviceNames, peopleCount, date, startTime, endTime, startAtMillis, status, note, reminderSentAt, createdAt, cancelledBy)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'zakazano', ?, NULL, ?, NULL)`
    ).run(
      id,
      req.user!.id,
      req.user!.fullName,
      req.user!.phone,
      JSON.stringify(serviceIds),
      JSON.stringify(serviceNames ?? []),
      people,
      date,
      startTime,
      endTime,
      startAtMillis,
      note ?? '',
      Date.now()
    );
    return id;
  });

  let id: string;
  try {
    id = run();
  } catch (e: any) {
    if (e.message === 'SLOT_TAKEN') return res.status(409).json({ error: 'SLOT_TAKEN' });
    throw e;
  }

  const row = db.prepare('SELECT * FROM appointments WHERE id = ?').get(id) as AppointmentRow;

  sendExpoPush(
    getAdminTokens(db),
    'Nov termin',
    `${row.clientName}: ${JSON.parse(row.serviceNames).join(', ')} — ${row.date} u ${row.startTime}`,
    { type: 'new_appointment', appointmentId: id }
  );
  sendExpoPush(getUserToken(db, req.user!.id), 'Termin uspešno zakazan', `${row.date} u ${row.startTime}. Vidimo se!`, {
    type: 'appointment_booked',
    appointmentId: id,
  });

  res.json({ appointment: toAppointment(row) });
});

appointmentsRouter.post('/:id/cancel', (req, res) => {
  const appt = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id) as AppointmentRow | undefined;
  if (!appt) return res.status(404).json({ error: 'Termin ne postoji.' });
  const isOwner = appt.clientId === req.user!.id;
  if (!isOwner && req.user!.role !== 'admin') return res.status(403).json({ error: 'Nemaš pristup.' });

  const cancelledBy = req.user!.role === 'admin' ? 'admin' : 'client';
  db.prepare("UPDATE appointments SET status = 'otkazano', cancelledBy = ? WHERE id = ?").run(cancelledBy, req.params.id);

  if (cancelledBy === 'admin') {
    sendExpoPush(getUserToken(db, appt.clientId), 'Termin otkazan', `Tvoj termin ${appt.date} u ${appt.startTime} je otkazan.`, {
      type: 'appointment_cancelled',
    });
  } else {
    sendExpoPush(getAdminTokens(db), 'Termin otkazan', `${appt.clientName} je otkazao/la termin ${appt.date} u ${appt.startTime}.`, {
      type: 'appointment_cancelled',
    });
  }

  res.json({ ok: true });
});

appointmentsRouter.post('/:id/confirm', (req, res) => {
  const appt = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id) as AppointmentRow | undefined;
  if (!appt) return res.status(404).json({ error: 'Termin ne postoji.' });
  if (appt.clientId !== req.user!.id && req.user!.role !== 'admin') return res.status(403).json({ error: 'Nemaš pristup.' });

  db.prepare("UPDATE appointments SET status = 'potvrdjeno' WHERE id = ?").run(req.params.id);
  sendExpoPush(getAdminTokens(db), 'Termin potvrđen', `${appt.clientName} je potvrdio/la dolazak ${appt.date} u ${appt.startTime}.`, {
    type: 'appointment_confirmed',
  });

  res.json({ ok: true });
});
