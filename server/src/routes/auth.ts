import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { config } from '../config';

const router = Router();

const LoginSchema = z.object({
  email: z.string().email({ message: 'Email invalide' }),
  password: z.string().min(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' }),
});

router.post('/login', async (req, res) => {
  const parseResult = LoginSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Payload invalide',
        details: parseResult.error.format(),
      },
    });
  }

  const { email, password } = parseResult.data;

  // TODO: Remplacer par une validation réelle en base de données.
  if (email !== 'admin@nucleus-pms.com' || password !== 'Admin123!') {
    return res.status(401).json({ success: false, error: { message: 'Identifiants invalides' } });
  }

  const user = {
    id: 1,
    firstName: 'Admin',
    lastName: 'Nucleus',
    email,
    role: 'Directeur',
  };

  const token = jwt.sign(
    {
      sub: String(user.id),
      email: user.email,
      role: user.role,
    },
    config.jwtSecret,
    { expiresIn: '8h' }
  );

  res.json({ success: true, token, user });
});

export default router;
