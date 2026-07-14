import { PrismaClient } from '@prisma/client';
import { logger } from '../config';

// Singleton instance
export const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' },
  ],
});

// Facultatif: logguer les requêtes lentes
prisma.$on('query', (e) => {
  if (e.duration > 100) {
    logger.warn(`Query took ${e.duration}ms: ${e.query}`);
  }
});

// Wrapper pour les transactions
export async function executeInTransaction<T>(
  callback: (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<T>
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    return callback(tx);
  });
}
