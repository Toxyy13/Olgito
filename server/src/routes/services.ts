import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { db } from '../db';
import { requireAuth, requireAdmin } from '../auth/middleware';

export const servicesRouter = Router();
servicesRouter.use(requireAuth);

interface ServiceRow {
  id: string;
  name: string;
  price: number;
  active: number;
}

function toService(row: ServiceRow) {
  return { ...row, active: !!row.active };
}

servicesRouter.get('/', (req, res) => {
  const rows =
    req.user!.role === 'admin'
      ? (db.prepare('SELECT * FROM services').all() as ServiceRow[])
      : (db.prepare('SELECT * FROM services WHERE active = 1').all() as ServiceRow[]);
  res.json({ services: rows.map(toService) });
});

servicesRouter.post('/', requireAdmin, (req, res) => {
  const { name, price } = req.body ?? {};
  if (typeof name !== 'string' || name.trim().length < 2) return res.status(400).json({ error: 'Unesi naziv usluge.' });
  const priceNum = Number(price);
  if (!priceNum || priceNum <= 0) return res.status(400).json({ error: 'Unesi ispravnu cenu.' });

  const id = randomUUID();
  db.prepare('INSERT INTO services (id, name, price, active) VALUES (?, ?, ?, 1)').run(id, name.trim(), priceNum);
  res.json({ service: toService(db.prepare('SELECT * FROM services WHERE id = ?').get(id) as ServiceRow) });
});

servicesRouter.patch('/:id', requireAdmin, (req, res) => {
  const existing = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id) as ServiceRow | undefined;
  if (!existing) return res.status(404).json({ error: 'Usluga ne postoji.' });

  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : existing.name;
  const price = req.body?.price != null ? Number(req.body.price) : existing.price;
  const active = req.body?.active != null ? (req.body.active ? 1 : 0) : existing.active;

  db.prepare('UPDATE services SET name = ?, price = ?, active = ? WHERE id = ?').run(name, price, active, req.params.id);
  res.json({ service: toService(db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id) as ServiceRow) });
});

servicesRouter.delete('/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM services WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});
