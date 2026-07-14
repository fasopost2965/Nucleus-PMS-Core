import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'nucleus_pms_super_secret_key_2026';
export const JWT_EXPIRES_IN = '24h';

export interface IJwtPayload {
  id: number;
  email: string;
  role: string;
  name?: string;
}

export function generateToken(payload: IJwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): IJwtPayload {
  return jwt.verify(token, JWT_SECRET) as IJwtPayload;
}
