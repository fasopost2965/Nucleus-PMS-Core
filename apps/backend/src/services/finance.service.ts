import { FolioRepository } from '../repositories/folio.repository';
import { executeInTransaction } from '../repositories/prisma';
import { NotFoundError, BusinessRuleError } from '../utils/errors';
import { Folio, FolioItem, Payment, Invoice, PaymentMethod } from '@prisma/client';

export class FinanceService {
  private folioRepo: FolioRepository;

  constructor() {
    this.folioRepo = new FolioRepository();
  }

  async getFolioById(id: number): Promise<Folio> {
    const folio = await this.folioRepo.findById(id);
    if (!folio) throw new NotFoundError('Folio introuvable');
    return folio;
  }

  async getFolios(): Promise<Folio[]> {
    return this.folioRepo.findAll();
  }

  async addFolioItem(data: { folioId: number; description: string; amount: number; quantity?: number }): Promise<FolioItem> {
    return executeInTransaction(async (tx) => {
      const folio = await tx.folio.findUnique({ where: { id: data.folioId } });
      if (!folio) throw new NotFoundError('Folio introuvable');
      if (folio.status === 'CLOSED') throw new BusinessRuleError('Impossible d\'ajouter un débit sur un folio fermé');

      const quantity = data.quantity || 1;
      const totalAmount = data.amount * quantity;

      const item = await tx.folioItem.create({
        data: {
          folioId: data.folioId,
          description: data.description,
          amount: data.amount,
          quantity
        }
      });

      // Update folio balance atomically
      await tx.folio.update({
        where: { id: folio.id },
        data: { balance: { increment: totalAmount } }
      });

      return item;
    });
  }

  async addPayment(data: { folioId: number; amount: number; method: PaymentMethod; reference?: string }): Promise<Payment> {
    return executeInTransaction(async (tx) => {
      const folio = await tx.folio.findUnique({ where: { id: data.folioId } });
      if (!folio) throw new NotFoundError('Folio introuvable');

      const payment = await tx.payment.create({
        data: {
          folioId: data.folioId,
          amount: data.amount,
          method: data.method,
          reference: data.reference
        }
      });

      // Update folio balance atomically
      await tx.folio.update({
        where: { id: folio.id },
        data: { balance: { decrement: data.amount } }
      });

      return payment;
    });
  }

  async generateInvoice(folioId: number): Promise<Invoice> {
    return executeInTransaction(async (tx) => {
      const folio = await tx.folio.findUnique({ 
        where: { id: folioId },
        include: { items: true, payments: true, invoice: true }
      });
      if (!folio) throw new NotFoundError('Folio introuvable');
      if (folio.invoice) throw new BusinessRuleError('Une facture existe déjà pour ce folio');

      const settings = await tx.settings.findUnique({ where: { hotelId: 1 } });
      const vatRate = settings ? Number(settings.vatRate) : 18;
      const invoicePrefix = settings ? settings.invoicePrefix : 'FAC-';

      let totalAmount = 0;
      folio.items.forEach(item => {
        totalAmount += Number(item.amount) * item.quantity;
      });

      const taxAmount = totalAmount - (totalAmount / (1 + vatRate / 100));

      // ✅ Sprint 4 — Numéro unique basé sur folioId + timestamp (sans dépendance externe)
      const year = new Date().getFullYear();
      const uniqueSuffix = `${folioId}-${Date.now().toString(36).toUpperCase()}`;
      const invoiceNumber = `${invoicePrefix}${year}-${uniqueSuffix}`;

      const invoice = await tx.invoice.create({
        data: {
          folioId,
          invoiceNumber,
          totalAmount,
          taxAmount,
          status: 'ISSUED'
        }
      });

      return invoice;
    });
  }
}
