import { PrismaClient } from '@prisma/client';
import { prisma } from './prisma';

export type TransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

export abstract class BaseRepository<T> {
  protected get db() {
    return prisma;
  }
}
