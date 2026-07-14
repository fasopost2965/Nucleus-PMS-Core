import { prisma } from '../repositories/prisma';
import { parse } from 'json2csv';

export class ReportService {
  async getFinancialReportCsv(startDate: Date, endDate: Date): Promise<string> {
    const payments = await prisma.payment.findMany({
      where: {
        date: { gte: startDate, lte: endDate }
      },
      include: {
        folio: {
          include: {
            reservation: {
              include: { guest: true, room: true }
            }
          }
        }
      },
      orderBy: { date: 'asc' }
    });

    const data = payments.map(p => ({
      'Date': p.date.toISOString().split('T')[0],
      'Client': p.folio.reservation.guest ? `${p.folio.reservation.guest.firstName} ${p.folio.reservation.guest.lastName}` : 'N/A',
      'Chambre': p.folio.reservation.room ? p.folio.reservation.room.number : 'N/A',
      'Montant': Number(p.amount),
      'Méthode': p.method,
      'Référence': p.reference || ''
    }));

    if (data.length === 0) return 'Aucune donnée pour cette période';

    const fields = ['Date', 'Client', 'Chambre', 'Montant', 'Méthode', 'Référence'];
    return parse(data, { fields });
  }

  async getOccupancyReportCsv(startDate: Date, endDate: Date): Promise<string> {
    const reservations = await prisma.reservation.findMany({
      where: {
        checkInDate: { lte: endDate },
        checkOutDate: { gte: startDate },
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
        deletedAt: null
      },
      include: { guest: true, room: true },
      orderBy: { checkInDate: 'asc' }
    });

    const data = reservations.map(r => ({
      'Client': `${r.guest.firstName} ${r.guest.lastName}`,
      'Chambre': r.room.number,
      'Arrivée': r.checkInDate.toISOString().split('T')[0],
      'Départ': r.checkOutDate.toISOString().split('T')[0],
      'Statut': r.status,
      'Adultes': r.adults,
      'Enfants': r.children
    }));

    if (data.length === 0) return 'Aucune réservation pour cette période';

    const fields = ['Client', 'Chambre', 'Arrivée', 'Départ', 'Statut', 'Adultes', 'Enfants'];
    return parse(data, { fields });
  }
}
