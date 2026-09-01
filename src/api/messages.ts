import { apiFetch, poll } from './client';
import type { ChatMessage, ChatConversation } from '../types';

export function watchMessages(clientId: string, cb: (messages: ChatMessage[]) => void) {
  return poll(() => apiFetch<{ messages: ChatMessage[] }>(`/messages/${clientId}`).then((r) => r.messages), cb, 4000);
}

export async function sendMessage(clientId: string, text: string): Promise<void> {
  await apiFetch(`/messages/${clientId}`, { method: 'POST', body: JSON.stringify({ text }) });
}

export function watchConversations(cb: (conversations: ChatConversation[]) => void) {
  return poll(() => apiFetch<{ conversations: ChatConversation[] }>('/messages').then((r) => r.conversations), cb);
}

export async function resolveConversation(clientId: string): Promise<void> {
  await apiFetch(`/messages/${clientId}/resolve`, { method: 'POST' });
}
