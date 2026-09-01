import { API_URL, getToken } from './client';

export async function uploadProfilePhoto(_uid: string, localUri: string): Promise<string> {
  const token = await getToken();
  const form = new FormData();
  form.append('photo', {
    uri: localUri,
    name: 'photo.jpg',
    type: 'image/jpeg',
  } as any);

  const res = await fetch(`${API_URL}/api/uploads/profile-photo`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // Content-Type se NE postavlja ručno — fetch sam dodaje multipart boundary.
    },
    body: form,
  });

  const body = await res.json();
  if (!res.ok) throw new Error(body?.error ?? 'Slanje slike nije uspelo.');
  return body.url as string;
}
