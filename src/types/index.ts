export type Role = 'admin' | 'client';

export type AccountStatus = 'pending' | 'approved' | 'blocked' | 'rejected';

export interface AppUser {
  uid: string;
  role: Role;
  email: string; // koristi se za prijavu (email + lozinka)
  phone: string; // kontakt broj, unosi se pri dopuni profila
  fullName: string; // ime i prezime
  age: number | null;
  photoURL: string | null;
  profileComplete: boolean; // true kad su fullName + age + phone uneti
  accountStatus: AccountStatus;
  expoPushToken?: string;
  createdAt: number;
}

// Vrste usluga koje Olgica nudi (cena je informativna — ne utiče na trajanje termina,
// trajanje uvek zavisi samo od broja osoba).
export interface ServiceType {
  id: string;
  name: string; // npr. "Šišanje", "Brijanje", "Pranje kose"
  price: number; // u RSD, uređuje Olgica, vidljivo svima u cenovniku
  active: boolean;
}

export type AppointmentStatus = 'zakazano' | 'potvrdjeno' | 'otkazano';

// Svaki termin je blok od 30 min. Broj osoba određuje koliko uzastopnih
// slotova se rezerviše (npr. 2 osobe = 60 min = 2 slota).
export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  serviceIds: string[];
  serviceNames: string[];
  peopleCount: number;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm, izračunato kao startTime + peopleCount * 30min
  startAtMillis: number; // date+startTime kao timestamp, radi upita (npr. 24h podsetnik)
  status: AppointmentStatus;
  note?: string;
  reminderSentAt?: number | null;
  rebookPromptedAt?: number | null;
  createdAt: number;
  cancelledBy?: Role | null;
}

export interface DayHours {
  closed: boolean;
  start: string; // HH:mm
  end: string; // HH:mm
}

export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export type WeeklyDefaultHours = Record<Weekday, DayHours>;

// Ručni izuzetak za konkretan datum (drugo radno vreme ili slobodan dan).
export interface WorkingHoursOverride {
  date: string; // YYYY-MM-DD
  closed: boolean;
  start?: string;
  end?: string;
}

// Ručno blokiran termin u toku dana (pauza).
export interface BlockedSlot {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  reason?: string;
}

export type UrgentRequestStatus = 'open' | 'resolved';

export interface UrgentRequest {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientPhotoURL?: string | null;
  note: string;
  status: UrgentRequestStatus;
  createdAt: number;
}

export interface AppVersionInfo {
  versionName: string;
  versionCode: number;
  apkUrl: string;
  releaseNotes: string | null;
  updatedAt: number;
}

export interface ChatConversation {
  clientId: string;
  clientName: string;
  clientPhotoURL?: string | null;
  lastText: string;
  lastSenderRole: 'admin' | 'client';
  lastAt: number;
}

export interface ChatMessage {
  id: string;
  clientId: string;
  senderId: string;
  senderRole: 'admin' | 'client';
  text: string;
  createdAt: number;
}

export interface UrgentRequestMessage {
  id: string;
  requestId: string;
  senderId: string;
  senderRole: 'admin' | 'client';
  text: string;
  createdAt: number;
}

export type RescheduleRequestStatus = 'pending' | 'accepted' | 'declined';

export interface RescheduleRequest {
  id: string;
  appointmentId: string;
  clientId: string;
  message: string;
  status: RescheduleRequestStatus;
  createdAt: number;
}

export const SLOT_MINUTES = 30;
