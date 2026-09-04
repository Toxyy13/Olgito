import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { db } from './db';
import { authRouter } from './routes/auth';
import { usersRouter } from './routes/users';
import { servicesRouter } from './routes/services';
import { workingHoursRouter } from './routes/workingHours';
import { appointmentsRouter } from './routes/appointments';
import { urgentRequestsRouter } from './routes/urgentRequests';
import { rescheduleRequestsRouter } from './routes/rescheduleRequests';
import { messagesRouter } from './routes/messages';
import { uploadsRouter } from './routes/uploads';
import { appVersionRouter } from './routes/appVersion';
import { startReminderJob } from './reminders';

async function bootstrapAdmin() {
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) return;

  const existingAdmin = db.prepare("SELECT id FROM users WHERE role = 'admin'").get();
  if (existingAdmin) return;

  const email = ADMIN_EMAIL.toLowerCase();
  const already = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (already) {
    db.prepare("UPDATE users SET role = 'admin', accountStatus = 'approved' WHERE email = ?").run(email);
    console.log(`Nalog ${email} je unapređen u admina.`);
    return;
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  db.prepare(
    `INSERT INTO users (id, role, email, passwordHash, phone, fullName, age, photoURL, profileComplete, accountStatus, createdAt)
     VALUES (?, 'admin', ?, ?, '', 'Olgica', NULL, NULL, 1, 'approved', ?)`
  ).run(randomUUID(), email, passwordHash, Date.now());
  console.log(`Napravljen admin nalog: ${email}`);
}

async function main() {
  // Bez ovoga, neuhvaćena greška u BILO KOM async route handleru (npr.
  // race na duplo poslat zahtev) obara ceo Node proces — i sve korisnike,
  // ne samo onaj jedan zahtev. Express 4 ne hvata odbačene promise-e iz
  // async handlera sam od sebe.
  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled promise rejection:', reason);
  });

  await bootstrapAdmin();

  const app = express();
  // Auth ide preko Bearer tokena (ne kolačića), pa otvoren CORS sam po sebi
  // ne otkriva tokene drugim sajtovima — ali kad postoji ALLOWED_ORIGINS
  // (npr. u produkciji, sa admin/web panelom na poznatom domenu), suzi na
  // taj spisak. Mobilna app i alati kao curl ne šalju Origin header uopšte,
  // pa se uvek propuštaju.
  const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  app.use(
    cors({
      origin: allowedOrigins.length === 0 ? true : (origin, cb) => cb(null, !origin || allowedOrigins.includes(origin)),
    })
  );
  app.use(express.json());
  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

  app.get('/health', (_req, res) => res.json({ ok: true }));

  app.use('/auth', authRouter);
  app.use('/users', usersRouter);
  app.use('/services', servicesRouter);
  app.use('/working-hours', workingHoursRouter);
  app.use('/appointments', appointmentsRouter);
  app.use('/urgent-requests', urgentRequestsRouter);
  app.use('/reschedule-requests', rescheduleRequestsRouter);
  app.use('/messages', messagesRouter);
  app.use('/app-version', appVersionRouter);
  app.use('/api/uploads', uploadsRouter);

  startReminderJob();

  const port = Number(process.env.PORT ?? 4000);
  app.listen(port, () => console.log(`Olgito server sluša na portu ${port}`));
}

main();
