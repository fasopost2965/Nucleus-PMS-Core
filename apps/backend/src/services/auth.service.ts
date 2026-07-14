import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository';
import { AuthenticationError, BusinessRuleError } from '../utils/errors';
import { authConfig } from '../config';

export interface LoginDto {
  email: string;
  password: string;
}

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async login(data: LoginDto) {
    const user = await this.userRepository.findByEmailWithPermissions(data.email);

    if (!user) {
      throw new AuthenticationError('Email ou mot de passe incorrect');
    }

    if (!user.isActive) {
      throw new BusinessRuleError('Ce compte a été désactivé', 'ACCOUNT_DISABLED');
    }

    if (user.deletedAt) {
      throw new AuthenticationError('Email ou mot de passe incorrect');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AuthenticationError('Email ou mot de passe incorrect');
    }

    // Convertir les permissions dans un format simple (action:subject)
    const permissions = user.role.permissions.map(p => `${p.action}:${p.subject}`);

    // Générer le token JWT
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role.name,
      permissions,
    };

    const token = jwt.sign(payload, authConfig.jwtSecret, {
      expiresIn: authConfig.jwtExpiresIn as any,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role.name,
        permissions,
      },
    };
  }
}
