import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { db } from '../db';
import { signToken } from '../auth/jwt';
import { requireAuth } from '../auth/middleware';
import { toPublicUser, type UserRow } from '../types';

export const authRouter = Router();

authRouter.post('/register', async (req, res) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: 'Unesi ispravnu email adresu.' });
  }
  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'Lozinka mora imati bar 6 karaktera.' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (existing) return res.status(409).json({ error: 'Već postoji nalog sa ovim emailom.' });

  const id = randomUUID();
  const passwordHash = await bcrypt.hash(password, 10);
  db.prepare(
    `INSERT INTO users (id, role, email, passwordHash, phone, fullName, age, photoURL, profileComplete, accountStatus, createdAt)
     VALUES (?, 'client', ?, ?, '', '', NULL, NULL, 0, 'pending', ?)`
  ).run(id, email.toLowerCase(), passwordHash, Date.now());

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow;
  res.json({ token: signToken(id), user: toPublicUser(user) });
});

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Unesi email i lozinku.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase()) as UserRow | undefined;
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Pogrešan email ili lozinka.' });
  }

  res.json({ token: signToken(user.id), user: toPublicUser(user) });
});

authRouter.get('/me', requireAuth, (req, res) => {
  res.json({ user: toPublicUser(req.user!) });
});
