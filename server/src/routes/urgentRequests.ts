import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { db } from '../db';
import { requireAuth, requireAdmin, requireApprovedClient } from '../auth/middleware';
import { sendExpoPush, getAdminTokens, getUserToken } from '../push';

export const urgentRequestsRouter = Router();
urgentRequestsRouter.use(requireAuth);

urgentRequestsRouter.get('/', requireAdmin, (_req, res) => {
  const rows = db
    .prepare(
      `SELECT ur.*, u.photoURL as clientPhotoURL FROM urgent_requests ur
       LEFT JOIN users u ON u.id = ur.clientId
       ORDER BY ur.createdAt DESC`
    )
    .all();
  res.json({ requests: rows });
});

urgentRequestsRouter.get('/mine', (req, res) => {
  const rows = db.prepare('SELECT * FROM urgent_requests WHERE clientId = ? ORDER BY createdAt DESC').all(req.user!.id);
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
  // Briše i čet vezan za ovaj zahtev — i kod klijenta, jer čitaju istu tabelu.
  db.prepare('DELETE FROM urgent_request_messages WHERE requestId = ?').run(req.params.id);
  res.json({ ok: true });
});

function getRequestOrForbid(req: import('express').Request, res: import('express').Response) {
  const request = db.prepare('SELECT * FROM urgent_requests WHERE id = ?').get(req.params.id) as
    | { id: string; clientId: string }
    | undefined;
  if (!request) {
    res.status(404).json({ error: 'Zahtev ne postoji.' });
    return null;
  }
  if (req.user!.role !== 'admin' && request.clientId !== req.user!.id) {
    res.status(403).json({ error: 'Nemaš pristup ovom zahtevu.' });
    return null;
  }
  return request;
}

urgentRequestsRouter.get('/:id/messages', (req, res) => {
  const request = getRequestOrForbid(req, res);
  if (!request) return;

  const rows = db
    .prepare('SELECT * FROM urgent_request_messages WHERE requestId = ? ORDER BY createdAt ASC')
    .all(req.params.id);
  res.json({ messages: rows });
});

urgentRequestsRouter.post('/:id/messages', (req, res) => {
  const request = getRequestOrForbid(req, res);
  if (!request) return;

  const { text } = req.body ?? {};
  if (typeof text !== 'string' || text.trim().length === 0) return res.status(400).json({ error: 'Napiši poruku.' });

  const id = randomUUID();
  const senderRole = req.user!.role;
  db.prepare(
    'INSERT INTO urgent_request_messages (id, requestId, senderId, senderRole, text, createdAt) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, req.params.id, req.user!.id, senderRole, text.trim(), Date.now());

  const recipientToken = senderRole === 'admin' ? getUserToken(db, request.clientId) : getAdminTokens(db);
  const title = senderRole === 'admin' ? 'Olgica ti je odgovorila' : `${req.user!.fullName} je odgovorio/la`;
  sendExpoPush(recipientToken, title, text.trim(), { type: 'urgent_request_message', requestId: req.params.id });

  res.json({ id });
});
