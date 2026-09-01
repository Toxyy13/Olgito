import cron from 'node-cron';
import { db } from './db';
import { sendExpoPush, getUserToken, getAdminTokens } from './push';

const WINDOW_MS = 24 * 60 * 60 * 1000;
const REPLY_WINDOW_MS = 30 * 60 * 1000;
const GROWTH_WINDOW_MS = 21 * 24 * 60 * 60 * 1000;

const GROWTH_MESSAGES = [
  'Heeej, kosa ti raste, zakaži na vreme! 💇',
  'Uska je pauza — vreme je za novo šišanje kod Olgice!',
  'Alarm za frizuru: 3 nedelje su prošle, kosa ne čeka!',
];

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

interface DueMessage {
  id: string;
  clientId: string;
  senderRole: 'admin' | 'client';
  createdAt: number;
}

// Podseća onog ko nije odgovorio poslednjih 30 min u čatu — gleda samo
// poslednju poruku po razgovoru (starije poruke već imaju odgovor iznad sebe).
function checkMessageReminders() {
  const now = Date.now();
  const rows = db
    .prepare(
      `SELECT m.id, m.clientId, m.senderRole, m.createdAt FROM messages m
       INNER JOIN (SELECT clientId, MAX(createdAt) as maxCreated FROM messages GROUP BY clientId) latest
         ON m.clientId = latest.clientId AND m.createdAt = latest.maxCreated
       WHERE m.reminderSentAt IS NULL`
    )
    .all() as DueMessage[];

  for (const row of rows) {
    if (now - row.createdAt < REPLY_WINDOW_MS) continue;

    if (row.senderRole === 'client') {
      sendExpoPush(getAdminTokens(db), 'Neodgovorena poruka', 'Klijent čeka tvoj odgovor u čatu već 30+ minuta.', {
        type: 'message_reminder',
        clientId: row.clientId,
      });
    } else {
      sendExpoPush(getUserToken(db, row.clientId), 'Neodgovorena poruka', 'Olgica čeka tvoj odgovor u čatu već 30+ minuta.', {
        type: 'message_reminder',
        clientId: row.clientId,
      });
    }
    db.prepare('UPDATE messages SET reminderSentAt = ? WHERE id = ?').run(now, row.id);
  }
}

interface DueGrowth {
  id: string;
  clientId: string;
  startAtMillis: number;
}

// Šaljivi podsetnik 3 nedelje posle poslednjeg (nezakazanog) termina — gleda
// samo najskoriji termin po klijentu, jer ako se u međuvremenu zakazao novi,
// taj postaje najskoriji i stari se više ne broji.
function checkGrowthReminders() {
  const now = Date.now();
  const rows = db
    .prepare(
      `SELECT a.id, a.clientId, a.startAtMillis FROM appointments a
       INNER JOIN (
         SELECT clientId, MAX(startAtMillis) as maxStart FROM appointments WHERE status != 'otkazano' GROUP BY clientId
       ) latest ON a.clientId = latest.clientId AND a.startAtMillis = latest.maxStart
       WHERE a.status != 'otkazano' AND a.growthReminderSentAt IS NULL`
    )
    .all() as DueGrowth[];

  for (const row of rows) {
    if (now - row.startAtMillis < GROWTH_WINDOW_MS) continue;

    const token = getUserToken(db, row.clientId);
    if (token) {
      const message = GROWTH_MESSAGES[Math.floor(Math.random() * GROWTH_MESSAGES.length)];
      sendExpoPush(token, 'Olgito podseća 😄', message, { type: 'growth_reminder', appointmentId: row.id });
    }
    db.prepare('UPDATE appointments SET growthReminderSentAt = ? WHERE id = ?').run(now, row.id);
  }
}

export function startReminderJob() {
  cron.schedule('*/15 * * * *', () => {
    checkReminders();
    checkMessageReminders();
    checkGrowthReminders();
  });
  // I odmah pri startu servera, za slučaj da je bio ugašen duže od 15 min.
  checkReminders();
  checkMessageReminders();
  checkGrowthReminders();
}
