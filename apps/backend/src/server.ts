import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { appConfig, logger } from './config';
import { prisma } from './repositories/prisma';

const PORT = appConfig.port;

async function main() {
  try {
    // Verify database connection
    await prisma.$connect();
    logger.info('✅ Connexion à la base de données établie.');

    const server = app.listen(PORT, () => {
      logger.info(`🚀 Serveur Nucleus PMS démarré sur le port ${PORT} [${appConfig.nodeEnv}]`);
      logger.info(`📖 Documentation API: http://localhost:${PORT}/api-docs`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`Signal ${signal} reçu — arrêt gracieux...`);
      server.close(async () => {
        await prisma.$disconnect();
        logger.info('Connexion DB fermée. Serveur arrêté.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    logger.error('❌ Échec du démarrage du serveur:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
