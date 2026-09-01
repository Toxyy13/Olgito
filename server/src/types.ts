export type Role = 'admin' | 'client';
export type AccountStatus = 'pending' | 'approved' | 'blocked';

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

export type PublicUser = Omit<UserRow, 'passwordHash' | 'profileComplete'> & { profileComplete: boolean };

export function toPublicUser(row: UserRow): PublicUser {
  const { passwordHash, ...rest } = row;
  return { ...rest, profileComplete: !!row.profileComplete };
}
