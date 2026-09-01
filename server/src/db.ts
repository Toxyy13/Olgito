import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

export const db = new Database(path.join(dataDir, 'olgito.sqlite'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'client',
  email TEXT UNIQUE NOT NULL,
  passwordHash TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  fullName TEXT NOT NULL DEFAULT '',
  age INTEGER,
  photoURL TEXT,
  profileComplete INTEGER NOT NULL DEFAULT 0,
  accountStatus TEXT NOT NULL DEFAULT 'pending',
  expoPushToken TEXT,
  createdAt INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS working_hours_weekly (
  day TEXT PRIMARY KEY,
  closed INTEGER NOT NULL,
  start TEXT NOT NULL,
  end TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS working_hours_overrides (
  date TEXT PRIMARY KEY,
  closed INTEGER NOT NULL,
  start TEXT,
  end TEXT
);

CREATE TABLE IF NOT EXISTS blocked_slots (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  startTime TEXT NOT NULL,
  endTime TEXT NOT NULL,
  reason TEXT
);

CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  clientId TEXT NOT NULL,
  clientName TEXT NOT NULL,
  clientPhone TEXT NOT NULL,
  serviceIds TEXT NOT NULL,
  serviceNames TEXT NOT NULL,
  peopleCount INTEGER NOT NULL,
  date TEXT NOT NULL,
  startTime TEXT NOT NULL,
  endTime TEXT NOT NULL,
  startAtMillis INTEGER NOT NULL,
  status TEXT NOT NULL,
  note TEXT,
  reminderSentAt INTEGER,
  rebookPromptedAt INTEGER,
  growthReminderSentAt INTEGER,
  createdAt INTEGER NOT NULL,
  cancelledBy TEXT
);

CREATE TABLE IF NOT EXISTS urgent_requests (
  id TEXT PRIMARY KEY,
  clientId TEXT NOT NULL,
  clientName TEXT NOT NULL,
  clientPhone TEXT NOT NULL,
  note TEXT NOT NULL,
  status TEXT NOT NULL,
  createdAt INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS reschedule_requests (
  id TEXT PRIMARY KEY,
  appointmentId TEXT NOT NULL,
  clientId TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL,
  createdAt INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS urgent_request_messages (
  id TEXT PRIMARY KEY,
  requestId TEXT NOT NULL,
  senderId TEXT NOT NULL,
  senderRole TEXT NOT NULL,
  text TEXT NOT NULL,
  createdAt INTEGER NOT NULL
);

-- Opšta prepiska Olgica <-> klijent, nezavisna od hitnih zahteva — Olgica
-- može da otvori razgovor sa bilo kojim klijentom, ne samo onim koji je
-- poslao zahtev.
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  clientId TEXT NOT NULL,
  senderId TEXT NOT NULL,
  senderRole TEXT NOT NULL,
  text TEXT NOT NULL,
  reminderSentAt INTEGER,
  createdAt INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_client ON appointments(clientId);
CREATE INDEX IF NOT EXISTS idx_urgent_messages_request ON urgent_request_messages(requestId);
CREATE INDEX IF NOT EXISTS idx_messages_client ON messages(clientId);
`);

// messages je dodat u toku razvoja bez reminderSentAt kolone — ako baza već
// postoji od ranije, dodaj je naknadno da ne bi pukao ALTER na svakom startu.
const messageColumns = db.prepare('PRAGMA table_info(messages)').all() as { name: string }[];
if (!messageColumns.some((c) => c.name === 'reminderSentAt')) {
  db.exec('ALTER TABLE messages ADD COLUMN reminderSentAt INTEGER');
}

const appointmentColumns = db.prepare('PRAGMA table_info(appointments)').all() as { name: string }[];
if (!appointmentColumns.some((c) => c.name === 'rebookPromptedAt')) {
  db.exec('ALTER TABLE appointments ADD COLUMN rebookPromptedAt INTEGER');
}
if (!appointmentColumns.some((c) => c.name === 'growthReminderSentAt')) {
  db.exec('ALTER TABLE appointments ADD COLUMN growthReminderSentAt INTEGER');
}

const DEFAULT_WEEKLY: Array<[string, number, string, string]> = [
  ['mon', 0, '09:00', '17:00'],
  ['tue', 0, '09:00', '17:00'],
  ['wed', 0, '09:00', '17:00'],
  ['thu', 0, '09:00', '17:00'],
  ['fri', 0, '09:00', '17:00'],
  ['sat', 0, '09:00', '14:00'],
  ['sun', 1, '09:00', '14:00'],
];

const weeklyCount = (db.prepare('SELECT COUNT(*) as c FROM working_hours_weekly').get() as { c: number }).c;
if (weeklyCount === 0) {
  const insert = db.prepare('INSERT INTO working_hours_weekly (day, closed, start, end) VALUES (?, ?, ?, ?)');
  const tx = db.transaction(() => {
    for (const row of DEFAULT_WEEKLY) insert.run(...row);
  });
  tx();
}
