// Šalje push notifikacije preko Expo Push API-ja (radi za iOS i Android bez
// dodatnih native SDK-ova na strani Cloud Functions).
export async function sendExpoPush(
  to: string | string[],
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<void> {
  const tokens = (Array.isArray(to) ? to : [to]).filter(Boolean);
  if (tokens.length === 0) return;

  const messages = tokens.map((token) => ({
    to: token,
    sound: 'default',
    title,
    body,
    data: data ?? {},
  }));

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-Encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messages),
  });
}
