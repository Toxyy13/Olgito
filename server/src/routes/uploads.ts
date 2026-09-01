import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { requireAuth } from '../auth/middleware';

export const uploadsRouter = Router();

const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'profile-photos');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (req, _file, cb) => cb(null, `${req.user!.id}.jpg`),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Fajl mora biti slika.'));
    cb(null, true);
  },
});

uploadsRouter.post('/profile-photo', requireAuth, upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nedostaje slika.' });
  const base = process.env.PUBLIC_BASE_URL ?? '';
  res.json({ url: `${base}/uploads/profile-photos/${req.user!.id}.jpg?v=${Date.now()}` });
});
