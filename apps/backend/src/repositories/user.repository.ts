import { BaseRepository } from './base.repository';
import { User, Role, Permission } from '@prisma/client';

export type UserWithRoleAndPermissions = User & {
  role: Role & {
    permissions: Permission[];
  };
};

export class UserRepository extends BaseRepository<User> {
  async findByEmailWithPermissions(email: string): Promise<UserWithRoleAndPermissions | null> {
    return this.db.user.findUnique({
      where: { email },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.db.user.findUnique({
      where: { id },
    });
  }
}
