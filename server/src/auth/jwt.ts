import jwt from 'jsonwebtoken';

const SECRET: string = (() => {
  const value = process.env.JWT_SECRET;
  if (!value) throw new Error('JWT_SECRET nije postavljen (vidi .env.example)');
  return value;
})();

export interface TokenPayload {
  uid: string;
}

export function signToken(uid: string): string {
  const payload: TokenPayload = { uid };
  return jwt.sign(payload, SECRET, { expiresIn: '180d' });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, SECRET) as unknown as TokenPayload;
}
