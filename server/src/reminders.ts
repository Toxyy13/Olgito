import cron from 'node-cron';
import { db } from './db';
import { sendExpoPush, getUserToken } from './push';

const WINDOW_MS = 24 * 60 * 60 * 1000;

interface DueAppointment {
  id: string;
  clientId: string;
  date: string;
  startTime: string;
  status: string;
  startAtMillis: number;
}

function checkReminders() {
  const now = Date.now();
  const rows = db
    .prepare('SELECT id, clientId, date, startTime, status, startAtMillis FROM appointments WHERE reminderSentAt IS NULL')
    .all() as DueAppointment[];

  for (const row of rows) {
    if (row.status === 'otkazano') continue;
    if (row.startAtMillis - now > WINDOW_MS || row.startAtMillis < now) continue;

    const token = getUserToken(db, row.clientId);
    if (token) {
      sendExpoPush(token, 'Potvrdi svoj termin', `Podseća te Olgito — termin ti je ${row.date} u ${row.startTime}. Potvrdi dolazak u aplikaciji.`, {
        type: 'reminder',
        appointmentId: row.id,
      });
    }
    db.prepare('UPDATE appointments SET reminderSentAt = ? WHERE id = ?').run(now, row.id);
  }
}

export function startReminderJob() {
  cron.schedule('*/15 * * * *', checkReminders);
  // I odmah pri startu servera, za slučaj da je bio ugašen duže od 15 min.
  checkReminders();
}
