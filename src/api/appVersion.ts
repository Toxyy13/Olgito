import { apiFetch } from './client';
import type { AppVersionInfo } from '../types';

export async function getLatestAppVersion(): Promise<AppVersionInfo | null> {
  const res = await apiFetch<{ version: AppVersionInfo | null }>('/app-version');
  return res.version;
}
