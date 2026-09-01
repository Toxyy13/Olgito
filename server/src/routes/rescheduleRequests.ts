import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { db } from '../db';
import { requireAuth, requireAdmin } from '../auth/middleware';
import { sendExpoPush, getUserToken, getAdminTokens } from '../push';

export const rescheduleRequestsRouter = Router();
rescheduleRequestsRouter.use(requireAuth);

rescheduleRequestsRouter.get('/mine', (req, res) => {
  const rows = db
    .prepare("SELECT * FROM reschedule_requests WHERE clientId = ? AND status = 'pending' ORDER BY createdAt DESC")
    .all(req.user!.id);
  res.json({ requests: rows });
});

rescheduleRequestsRouter.post('/', requireAdmin, (req, res) => {
  const { appointmentId, clientId, message } = req.body ?? {};
  if (typeof message !== 'string' || message.trim().length < 3) return res.status(400).json({ error: 'Napiši poruku.' });

  const id = randomUUID();
  db.prepare(
    'INSERT INTO reschedule_requests (id, appointmentId, clientId, message, status, createdAt) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, appointmentId, clientId, message.trim(), 'pending', Date.now());

  sendExpoPush(getUserToken(db, clientId), 'Zahtev za pomeranje termina', message.trim(), {
    type: 'reschedule_request',
    requestId: id,
  });

  res.json({ id });
});

rescheduleRequestsRouter.post('/:id/respond', (req, res) => {
  const row = db.prepare('SELECT * FROM reschedule_requests WHERE id = ?').get(req.params.id) as
    | { clientId: string }
    | undefined;
  if (!row) return res.status(404).json({ error: 'Zahtev ne postoji.' });
  if (row.clientId !== req.user!.id && req.user!.role !== 'admin') return res.status(403).json({ error: 'Nemaš pristup.' });

  const accepted = !!req.body?.accepted;
  db.prepare('UPDATE reschedule_requests SET status = ? WHERE id = ?').run(accepted ? 'accepted' : 'declined', req.params.id);

  sendExpoPush(
    getAdminTokens(db),
    accepted ? 'Klijent može da pomeri termin' : 'Klijent ne može da pomeri termin',
    `${req.user!.fullName} je ${accepted ? 'prihvatio/la' : 'odbio/la'} zahtev za pomeranje termina.`,
    { type: 'reschedule_response' }
  );

  res.json({ ok: true });
});
