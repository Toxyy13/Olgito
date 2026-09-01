// Šalje push notifikacije preko besplatnog Expo Push API-ja (radi za iOS i Android).
export async function sendExpoPush(
  to: string | string[] | null | undefined,
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<void> {
  const tokens = (Array.isArray(to) ? to : [to]).filter((t): t is string => !!t);
  if (tokens.length === 0) return;

  const messages = tokens.map((token) => ({
    to: token,
    sound: 'default',
    title,
    body,
    data: data ?? {},
  }));

  try {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(messages),
    });
  } catch (err) {
    console.error('Push notifikacija nije poslata:', err);
  }
}

export function getAdminTokens(db: import('better-sqlite3').Database): string[] {
  const rows = db.prepare("SELECT expoPushToken FROM users WHERE role = 'admin' AND expoPushToken IS NOT NULL").all() as {
    expoPushToken: string;
  }[];
  return rows.map((r) => r.expoPushToken);
}

export function getUserToken(db: import('better-sqlite3').Database, uid: string): string | null {
  const row = db.prepare('SELECT expoPushToken FROM users WHERE id = ?').get(uid) as { expoPushToken: string | null } | undefined;
  return row?.expoPushToken ?? null;
}
