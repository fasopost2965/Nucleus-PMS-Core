import jwt from 'jsonwebtoken';

if (!process.env.JWT_SECRET) {
  throw new Error('[Config] JWT_SECRET manquant. Définissez la variable d\'environnement JWT_SECRET avant de démarrer le serveur.');
}

export const JWT_SECRET = process.env.JWT_SECRET;
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
