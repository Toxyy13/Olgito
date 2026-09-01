import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import sharp from 'sharp';
import { requireAuth } from '../auth/middleware';

export const uploadsRouter = Router();

const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'profile-photos');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Fajl se drži u memoriji (ne piše direktno na disk) da bi sharp mogao da ga
// smanji/kompresuje pre čuvanja — telefonske slike znaju da budu par MB, a
// prikazuju se svuda kao mali avatar (48-88px), pa nema smisla čuvati/slati
// originalnu rezoluciju.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Fajl mora biti slika.'));
    cb(null, true);
  },
});

uploadsRouter.post('/profile-photo', requireAuth, upload.single('photo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nedostaje slika.' });

  try {
    const outPath = path.join(uploadsDir, `${req.user!.id}.jpg`);
    await sharp(req.file.buffer)
      .rotate() // poštuje EXIF orijentaciju sa telefona
      .resize(512, 512, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toFile(outPath);
  } catch {
    return res.status(400).json({ error: 'Slika nije mogla da se obradi.' });
  }

  const base = process.env.PUBLIC_BASE_URL ?? '';
  res.json({ url: `${base}/uploads/profile-photos/${req.user!.id}.jpg?v=${Date.now()}` });
});
