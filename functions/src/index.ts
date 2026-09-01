import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { onDocumentCreated, onDocumentWritten } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { sendExpoPush } from './push';

initializeApp();
const db = getFirestore();

interface TimeRange {
  startTime: string;
  endTime: string;
  appointmentId: string;
}

async function getAdminTokens(): Promise<string[]> {
  const snap = await db.collection('users').where('role', '==', 'admin').get();
  return snap.docs.map((d) => d.data().expoPushToken).filter(Boolean);
}

async function getUserToken(uid: string): Promise<string | null> {
  const snap = await db.collection('users').doc(uid).get();
  return snap.exists ? snap.data()?.expoPushToken ?? null : null;
}

// Rekonstruiše availability/{date} iz svih ne-otkazanih termina tog dana —
// bezbednosna mreža pored transakcione provere pri zakazivanju na klijentu.
async function recomputeAvailability(dateISO: string): Promise<void> {
  const snap = await db.collection('appointments').where('date', '==', dateISO).get();
  const busyRanges: TimeRange[] = snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as any) }))
    .filter((a) => a.status !== 'otkazano')
    .map((a) => ({ startTime: a.startTime, endTime: a.endTime, appointmentId: a.id }));

  await db.collection('availability').doc(dateISO).set({ busyRanges });
}

// --- Novi klijent čeka odobrenje ---
export const onClientProfileCompleted = onDocumentWritten('users/{uid}', async (event) => {
  const before = event.data?.before.data();
  const after = event.data?.after.data();
  if (!after || after.role !== 'client') return;
  if (before?.profileComplete === true || after.profileComplete !== true) return;
  if (before?.accountStatus !== 'pending') return;

  const tokens = await getAdminTokens();
  await sendExpoPush(tokens, 'Nov klijent čeka odobrenje', `${after.fullName} (${after.phone})`, {
    type: 'new_client',
  });
});

// --- Termin kreiran / promenio status ---
export const onAppointmentWritten = onDocumentWritten('appointments/{id}', async (event) => {
  const before = event.data?.before.data() as any | undefined;
  const after = event.data?.after.data() as any | undefined;
  const date = after?.date ?? before?.date;
  if (date) await recomputeAvailability(date);

  if (!before && after) {
    // Nov termin.
    const adminTokens = await getAdminTokens();
    await sendExpoPush(
      adminTokens,
      'Nov termin',
      `${after.clientName}: ${after.serviceNames?.join(', ')} — ${after.date} u ${after.startTime}`,
      { type: 'new_appointment', appointmentId: event.params.id }
    );
    const clientToken = await getUserToken(after.clientId);
    if (clientToken) {
      await sendExpoPush(clientToken, 'Termin uspešno zakazan', `${after.date} u ${after.startTime}. Vidimo se!`, {
        type: 'appointment_booked',
        appointmentId: event.params.id,
      });
    }
    return;
  }

  if (before && after && before.status !== after.status) {
    if (after.status === 'otkazano') {
      if (after.cancelledBy === 'admin') {
        const clientToken = await getUserToken(after.clientId);
        if (clientToken) {
          await sendExpoPush(clientToken, 'Termin otkazan', `Tvoj termin ${after.date} u ${after.startTime} je otkazan.`, {
            type: 'appointment_cancelled',
          });
        }
      } else {
        const adminTokens = await getAdminTokens();
        await sendExpoPush(adminTokens, 'Termin otkazan', `${after.clientName} je otkazao/la termin ${after.date} u ${after.startTime}.`, {
          type: 'appointment_cancelled',
        });
      }
    } else if (after.status === 'potvrdjeno') {
      const adminTokens = await getAdminTokens();
      await sendExpoPush(adminTokens, 'Termin potvrđen', `${after.clientName} je potvrdio/la dolazak ${after.date} u ${after.startTime}.`, {
        type: 'appointment_confirmed',
      });
    }
  }
});

// --- Hitan zahtev ---
export const onUrgentRequestCreated = onDocumentCreated('urgentRequests/{id}', async (event) => {
  const data = event.data?.data();
  if (!data) return;
  const tokens = await getAdminTokens();
  await sendExpoPush(tokens, '🚨 Hitan zahtev', `${data.clientName}: ${data.note}`, {
    type: 'urgent_request',
    requestId: event.params.id,
  });
});

// --- Olgica traži pomeranje termina od klijenta ---
export const onRescheduleRequestCreated = onDocumentCreated('rescheduleRequests/{id}', async (event) => {
  const data = event.data?.data();
  if (!data) return;
  const token = await getUserToken(data.clientId);
  if (token) {
    await sendExpoPush(token, 'Zahtev za pomeranje termina', data.message, {
      type: 'reschedule_request',
      requestId: event.params.id,
    });
  }
});

// --- 24h podsetnik za potvrdu termina ---
export const sendAppointmentReminders = onSchedule('every 15 minutes', async () => {
  const now = Date.now();
  const windowMs = 24 * 60 * 60 * 1000;

  const snap = await db.collection('appointments').where('reminderSentAt', '==', null).get();

  for (const docSnap of snap.docs) {
    const data = docSnap.data() as any;
    if (data.status === 'otkazano') continue;
    if (!data.startAtMillis || data.startAtMillis - now > windowMs || data.startAtMillis < now) continue;

    const token = await getUserToken(data.clientId);
    if (token) {
      await sendExpoPush(token, 'Potvrdi svoj termin', `Podseća te Olgito — termin ti je ${data.date} u ${data.startTime}. Potvrdi dolazak u aplikaciji.`, {
        type: 'reminder',
        appointmentId: docSnap.id,
      });
    }
    await docSnap.ref.update({ reminderSentAt: FieldValue.serverTimestamp() });
  }
});
