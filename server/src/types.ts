export type Role = 'admin' | 'client';
export type AccountStatus = 'pending' | 'approved' | 'blocked' | 'rejected';

export interface UserRow {
  id: string;
  role: Role;
  email: string;
  passwordHash: string;
  phone: string;
  fullName: string;
  age: number | null;
  photoURL: string | null;
  profileComplete: number;
  accountStatus: AccountStatus;
  expoPushToken: string | null;
  createdAt: number;
}

export type PublicUser = Omit<UserRow, 'id' | 'passwordHash' | 'profileComplete'> & { uid: string; profileComplete: boolean };

// Klijent (app/) koristi "uid" kao naziv polja (nasleđeno iz ranijeg Firestore modela),
// dok je u SQLite-u to primarni ključ "id" — ovde se prevodi jedno u drugo.
export function toPublicUser(row: UserRow): PublicUser {
  const { id, passwordHash, ...rest } = row;
  return { ...rest, uid: id, profileComplete: !!row.profileComplete };
}
