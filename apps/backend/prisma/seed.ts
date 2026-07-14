import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 1. Initialiser l'Hôtel et ses Paramètres
  const hotel = await prisma.hotel.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Brunch Bouaké',
      city: 'Bouaké',
      country: 'Côte d\'Ivoire',
      settings: {
        create: {
          currency: 'XOF',
          timezone: 'Africa/Abidjan',
          vatRate: 18.00,
          tourismTaxRate: 1000.00,
          invoicePrefix: 'FAC-',
        },
      },
    },
  });
  console.log(`Hotel ${hotel.name} created.`);

  // 2. Initialiser les Permissions de base
  const permissions = [
    { action: 'manage', subject: 'all', description: 'Accès total au système' },
    { action: 'read', subject: 'reservations', description: 'Voir les réservations' },
    { action: 'manage', subject: 'reservations', description: 'Gérer les réservations' },
  ];

  for (const p of permissions) {
    await prisma.permission.upsert({
      where: {
        action_subject: {
          action: p.action,
          subject: p.subject,
        },
      },
      update: {},
      create: p,
    });
  }

  const allPermissions = await prisma.permission.findMany();

  // 3. Initialiser le Rôle Admin
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Administrateur principal',
      permissions: {
        connect: allPermissions.map(p => ({ id: p.id })),
      },
    },
  });
  console.log(`Role ${adminRole.name} created.`);

  // 4. Créer le premier Utilisateur Administrateur (Mot de passe: "admin123")
  const passwordHash = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@brunchbouake.local' },
    update: {},
    create: {
      email: 'admin@brunchbouake.local',
      firstName: 'Admin',
      lastName: 'Brunch',
      passwordHash,
      roleId: adminRole.id,
    },
  });
  console.log(`Admin user ${adminUser.email} created.`);

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
