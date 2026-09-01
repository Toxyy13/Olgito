import { Router } from 'express';
import { db } from '../db';
import { requireAuth, requireAdmin } from '../auth/middleware';
import { toPublicUser, type UserRow } from '../types';

export const usersRouter = Router();
usersRouter.use(requireAuth);

usersRouter.patch('/me/profile', (req, res) => {
  const { fullName, age, phone, photoURL } = req.body ?? {};
  if (typeof fullName !== 'string' || fullName.trim().length < 2) {
    return res.status(400).json({ error: 'Unesi ime i prezime.' });
  }
  const ageNum = Number(age);
  if (!ageNum || ageNum < 1 || ageNum > 120) return res.status(400).json({ error: 'Unesi ispravan broj godina.' });
  if (typeof phone !== 'string' || phone.trim().length < 5) {
    return res.status(400).json({ error: 'Unesi broj telefona.' });
  }

  db.prepare('UPDATE users SET fullName = ?, age = ?, phone = ?, photoURL = ?, profileComplete = 1 WHERE id = ?').run(
    fullName.trim(),
    ageNum,
    phone.trim(),
    photoURL ?? null,
    req.user!.id
  );
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user!.id) as UserRow;
  res.json({ user: toPublicUser(user) });
});

usersRouter.post('/me/push-token', (req, res) => {
  const { token } = req.body ?? {};
  if (typeof token !== 'string') return res.status(400).json({ error: 'Nedostaje token.' });
  db.prepare('UPDATE users SET expoPushToken = ? WHERE id = ?').run(token, req.user!.id);
  res.json({ ok: true });
});

usersRouter.get('/pending', requireAdmin, (_req, res) => {
  const rows = db.prepare("SELECT * FROM users WHERE role = 'client' AND accountStatus = 'pending'").all() as UserRow[];
  res.json({ users: rows.map(toPublicUser) });
});

usersRouter.get('/clients', requireAdmin, (_req, res) => {
  const rows = db.prepare("SELECT * FROM users WHERE role = 'client'").all() as UserRow[];
  res.json({ users: rows.map(toPublicUser) });
});

usersRouter.get('/rejected', requireAdmin, (_req, res) => {
  const rows = db
    .prepare("SELECT * FROM users WHERE role = 'client' AND accountStatus = 'rejected'")
    .all() as UserRow[];
  res.json({ users: rows.map(toPublicUser) });
});

usersRouter.post('/:id/approve', requireAdmin, (req, res) => {
  db.prepare("UPDATE users SET accountStatus = 'approved' WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

// Ne briše nalog — samo ga označava kao odbijen, tako da Olgica kasnije
// može da ga vidi u "Odbijeni klijenti" i eventualno se predomisli.
usersRouter.post('/:id/reject', requireAdmin, (req, res) => {
  db.prepare("UPDATE users SET accountStatus = 'rejected' WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

usersRouter.post('/:id/block', requireAdmin, (req, res) => {
  db.prepare("UPDATE users SET accountStatus = 'blocked' WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

usersRouter.post('/:id/unblock', requireAdmin, (req, res) => {
  db.prepare("UPDATE users SET accountStatus = 'approved' WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});
