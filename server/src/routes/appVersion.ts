import { Router } from 'express';
import { db } from '../db';
import { requireAuth, requireAdmin } from '../auth/middleware';

export const appVersionRouter = Router();
appVersionRouter.use(requireAuth);

interface AppVersionRow {
  versionName: string;
  versionCode: number;
  apkUrl: string;
  releaseNotes: string | null;
  updatedAt: number;
}

appVersionRouter.get('/', (_req, res) => {
  const row = db.prepare('SELECT * FROM app_version WHERE id = 1').get() as AppVersionRow | undefined;
  res.json({ version: row ?? null });
});

appVersionRouter.put('/', requireAdmin, (req, res) => {
  const { versionName, versionCode, apkUrl, releaseNotes } = req.body ?? {};
  if (typeof versionName !== 'string' || !Number.isFinite(Number(versionCode)) || typeof apkUrl !== 'string') {
    return res.status(400).json({ error: 'Nedostaju podaci o verziji.' });
  }
  db.prepare(
    `INSERT INTO app_version (id, versionName, versionCode, apkUrl, releaseNotes, updatedAt) VALUES (1, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET versionName = excluded.versionName, versionCode = excluded.versionCode,
       apkUrl = excluded.apkUrl, releaseNotes = excluded.releaseNotes, updatedAt = excluded.updatedAt`
  ).run(versionName, Number(versionCode), apkUrl, releaseNotes ?? null, Date.now());
  res.json({ ok: true });
});
