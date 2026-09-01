import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from './jwt';
import { db } from '../db';
import type { UserRow } from '../types';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: UserRow;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Niste prijavljeni.' });

  try {
    const { uid } = verifyToken(token);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(uid) as UserRow | undefined;
    if (!user) return res.status(401).json({ error: 'Nalog ne postoji.' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Sesija je istekla, prijavi se ponovo.' });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Samo za admina.' });
  next();
}

export function requireApprovedClient(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role === 'admin') return next();
  if (req.user?.role !== 'client' || req.user.accountStatus !== 'approved') {
    return res.status(403).json({ error: 'Nalog nije odobren.' });
  }
  next();
}
