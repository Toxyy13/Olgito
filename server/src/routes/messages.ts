import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { db } from '../db';
import { requireAuth, requireAdmin } from '../auth/middleware';
import { sendExpoPush, getAdminTokens, getUserToken } from '../push';
import type { UserRow } from '../types';

export const messagesRouter = Router();
messagesRouter.use(requireAuth);

function canAccess(req: import('express').Request, clientId: string) {
  return req.user!.role === 'admin' || req.user!.id === clientId;
}

// Lista aktivnih razgovora za admina — po jedan red po klijentu, sortirano
// po poslednjoj poruci. Razgovor nestaje sa liste kad Olgica klikne "rešeno".
messagesRouter.get('/', requireAdmin, (_req, res) => {
  const rows = db
    .prepare(
      `SELECT u.id as clientId, u.fullName as clientName, u.photoURL as clientPhotoURL,
              last.text as lastText, last.senderRole as lastSenderRole, last.createdAt as lastAt
       FROM (
         SELECT clientId, MAX(createdAt) as maxCreated FROM messages GROUP BY clientId
       ) grouped
       JOIN messages last ON last.clientId = grouped.clientId AND last.createdAt = grouped.maxCreated
       JOIN users u ON u.id = grouped.clientId
       ORDER BY last.createdAt DESC`
    )
    .all();
  res.json({ conversations: rows });
});

messagesRouter.post('/:clientId/resolve', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM messages WHERE clientId = ?').run(req.params.clientId);
  res.json({ ok: true });
});

messagesRouter.get('/:clientId', (req, res) => {
  if (!canAccess(req, req.params.clientId)) return res.status(403).json({ error: 'Nemaš pristup ovoj prepisci.' });

  const rows = db
    .prepare('SELECT * FROM messages WHERE clientId = ? ORDER BY createdAt ASC')
    .all(req.params.clientId);
  res.json({ messages: rows });
});

messagesRouter.post('/:clientId', (req, res) => {
  const { clientId } = req.params;
  if (!canAccess(req, clientId)) return res.status(403).json({ error: 'Nemaš pristup ovoj prepisci.' });

  const { text } = req.body ?? {};
  if (typeof text !== 'string' || text.trim().length === 0) return res.status(400).json({ error: 'Napiši poruku.' });

  if (req.user!.role === 'admin') {
    const client = db.prepare('SELECT * FROM users WHERE id = ?').get(clientId) as UserRow | undefined;
    if (!client || client.role !== 'client') return res.status(404).json({ error: 'Klijent ne postoji.' });
  }

  const id = randomUUID();
  const senderRole = req.user!.role;
  db.prepare(
    'INSERT INTO messages (id, clientId, senderId, senderRole, text, createdAt) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, clientId, req.user!.id, senderRole, text.trim(), Date.now());

  if (senderRole === 'admin') {
    sendExpoPush(getUserToken(db, clientId), 'Nova poruka od Olgice', text.trim(), {
      type: 'admin_message',
      clientId,
    });
  } else {
    sendExpoPush(getAdminTokens(db), `Poruka od: ${req.user!.fullName}`, text.trim(), {
      type: 'client_message',
      clientId,
    });
  }

  res.json({ id });
});
