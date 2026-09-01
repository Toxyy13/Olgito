import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { db } from '../db';
import { requireAuth, requireAdmin, requireApprovedClient } from '../auth/middleware';
import { sendExpoPush, getAdminTokens } from '../push';

export const urgentRequestsRouter = Router();
urgentRequestsRouter.use(requireAuth);

urgentRequestsRouter.get('/', requireAdmin, (_req, res) => {
  const rows = db.prepare('SELECT * FROM urgent_requests ORDER BY createdAt DESC').all();
  res.json({ requests: rows });
});

urgentRequestsRouter.post('/', requireApprovedClient, (req, res) => {
  const { note } = req.body ?? {};
  if (typeof note !== 'string' || note.trim().length < 5) return res.status(400).json({ error: 'Opiši kratko šta ti treba.' });

  const id = randomUUID();
  db.prepare(
    'INSERT INTO urgent_requests (id, clientId, clientName, clientPhone, note, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(id, req.user!.id, req.user!.fullName, req.user!.phone, note.trim(), 'open', Date.now());

  sendExpoPush(getAdminTokens(db), '🚨 Hitan zahtev', `${req.user!.fullName}: ${note.trim()}`, {
    type: 'urgent_request',
    requestId: id,
  });

  res.json({ id });
});

urgentRequestsRouter.post('/:id/resolve', requireAdmin, (req, res) => {
  db.prepare("UPDATE urgent_requests SET status = 'resolved' WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});
