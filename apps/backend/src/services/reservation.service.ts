import { ReservationRepository } from '../repositories/reservation.repository';
import { RoomRepository } from '../repositories/room.repository';
import { executeInTransaction } from '../repositories/prisma';
import { BusinessRuleError, NotFoundError, ConflictError } from '../utils/errors';
import { Reservation, ReservationStatus, RoomStatus } from '@prisma/client';

export class ReservationService {
  private reservationRepo: ReservationRepository;
  private roomRepo: RoomRepository;

  constructor() {
    this.reservationRepo = new ReservationRepository();
    this.roomRepo = new RoomRepository();
  }

  async getReservations(): Promise<Reservation[]> {
    return this.reservationRepo.findAll();
  }

  async getReservationById(id: number): Promise<Reservation> {
    const reservation = await this.reservationRepo.findById(id);
    if (!reservation) throw new NotFoundError('Réservation introuvable');
    return reservation;
  }

  async createReservation(data: any): Promise<Reservation> {
    // 1. Check room availability
    const room = await this.roomRepo.findById(data.roomId);
    if (!room) throw new NotFoundError('Chambre introuvable');

    const overlapping = await this.reservationRepo.findByRoomAndDates(data.roomId, new Date(data.checkInDate), new Date(data.checkOutDate));
    if (overlapping.length > 0) {
      throw new ConflictError('La chambre n\'est pas disponible pour ces dates');
    }

    // 2. Transaction: Create Reservation + Folio + Global FolioItem
    return executeInTransaction(async (tx) => {
      // Calculate nights (simplified)
      const checkIn = new Date(data.checkInDate);
      const checkOut = new Date(data.checkOutDate);
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      
      // La chambre est chargée avec include: { category: true } par le RoomRepository
      const basePrice = Number((room as any).category.basePrice);
      const totalAmount = nights * basePrice;

      const reservationData = {
        ...data,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        totalAmount
      };

      const reservation = await tx.reservation.create({ data: reservationData });

      const folio = await tx.folio.create({
        data: {
          reservationId: reservation.id,
          status: 'OPEN',
          balance: totalAmount
        }
      });

      await tx.folioItem.create({
        data: {
          folioId: folio.id,
          description: `Séjour du ${checkIn.toISOString().split('T')[0]} au ${checkOut.toISOString().split('T')[0]} (${nights} nuits)`,
          amount: basePrice,
          quantity: nights
        }
      });

      return this.reservationRepo.findById(reservation.id) as Promise<Reservation>;
    });
  }

  async checkIn(id: number): Promise<Reservation> {
    return executeInTransaction(async (tx) => {
      const reservation = await tx.reservation.findFirst({ where: { id, deletedAt: null } });
      if (!reservation) throw new NotFoundError('Réservation introuvable');
      
      if (reservation.status !== 'PENDING' && reservation.status !== 'CONFIRMED') {
        throw new BusinessRuleError('Seule une réservation en attente ou confirmée peut être Check-in');
      }

      await tx.room.update({
        where: { id: reservation.roomId },
        data: { status: 'OCCUPIED' }
      });

      await tx.reservation.update({
        where: { id },
        data: { status: 'CHECKED_IN', actualCheckIn: new Date() }
      });

      return this.reservationRepo.findById(id) as Promise<Reservation>;
    });
  }

  async checkOut(id: number): Promise<Reservation> {
    return executeInTransaction(async (tx) => {
      const reservation = await tx.reservation.findFirst({ 
        where: { id, deletedAt: null },
        include: { folio: true }
      });
      if (!reservation) throw new NotFoundError('Réservation introuvable');
      
      if (reservation.status !== 'CHECKED_IN') {
        throw new BusinessRuleError('Seule une réservation Check-in peut être Check-out');
      }

      // Check balance (must be 0 to checkout)
      if (reservation.folio && Number(reservation.folio.balance) !== 0) {
        throw new BusinessRuleError('Le solde du Folio doit être de 0 pour effectuer le Check-out', 'FOLIO_NOT_SETTLED');
      }

      await tx.room.update({
        where: { id: reservation.roomId },
        data: { status: 'AVAILABLE' } // Ou MAINTENANCE selon le process de l'hôtel
      });

      await tx.reservation.update({
        where: { id },
        data: { status: 'CHECKED_OUT', actualCheckOut: new Date() }
      });

      if (reservation.folio) {
        await tx.folio.update({
          where: { id: reservation.folio.id },
          data: { status: 'CLOSED' }
        });
      }

      return this.reservationRepo.findById(id) as Promise<Reservation>;
    });
  }

  async cancelReservation(id: number): Promise<Reservation> {
    return executeInTransaction(async (tx) => {
      const reservation = await tx.reservation.findFirst({ where: { id, deletedAt: null } });
      if (!reservation) throw new NotFoundError('Réservation introuvable');
      
      if (reservation.status === 'CHECKED_IN' || reservation.status === 'CHECKED_OUT') {
        throw new BusinessRuleError('Impossible d\'annuler une réservation déjà en cours ou terminée');
      }

      await tx.reservation.update({
        where: { id },
        data: { status: 'CANCELLED' }
      });
      
      if (reservation.status === 'CONFIRMED' || reservation.status === 'PENDING') {
         // Si on bloque la chambre à la résa, il faut la libérer. Ici le statut ROOM s'appuie sur RoomStatus (RESERVED)
         await tx.room.update({
            where: { id: reservation.roomId },
            data: { status: 'AVAILABLE' }
         });
      }

      return this.reservationRepo.findById(id) as Promise<Reservation>;
    });
  }
}
