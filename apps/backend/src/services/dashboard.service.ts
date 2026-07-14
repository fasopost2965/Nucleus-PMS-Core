import { prisma } from '../repositories/prisma';
import { startOfDay, endOfDay, startOfWeek, endOfWeek } from 'date-fns';

export class DashboardService {
  async getDashboardStats() {
    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);

    // 1. Occupancy Rate
    const totalRooms = await prisma.room.count({ where: { deletedAt: null } });
    const occupiedRooms = await prisma.room.count({ where: { status: 'OCCUPIED', deletedAt: null } });
    const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

    // 2. Today's Revenue (sum of payments today)
    const todayPayments = await prisma.payment.aggregate({
      where: {
        date: { gte: startOfToday, lte: endOfToday }
      },
      _sum: { amount: true }
    });
    const todayRevenue = todayPayments._sum.amount || 0;

    // 3. Arrivals / Departures Today
    const todayArrivals = await prisma.reservation.count({
      where: {
        checkInDate: { gte: startOfToday, lte: endOfToday },
        status: { in: ['PENDING', 'CONFIRMED'] },
        deletedAt: null
      }
    });

    const todayDepartures = await prisma.reservation.count({
      where: {
        checkOutDate: { gte: startOfToday, lte: endOfToday },
        status: 'CHECKED_IN',
        deletedAt: null
      }
    });

    // 4. Housekeeping Status
    const dirtyRooms = await prisma.room.count({ where: { cleaningStatus: 'DIRTY', deletedAt: null } });
    const cleaningRooms = await prisma.room.count({ where: { cleaningStatus: 'CLEANING', deletedAt: null } });
    const cleanRooms = await prisma.room.count({ where: { cleaningStatus: 'CLEAN', deletedAt: null } });
    const inspectedRooms = await prisma.room.count({ where: { cleaningStatus: 'INSPECTED', deletedAt: null } });

    return {
      occupancy: {
        totalRooms,
        occupiedRooms,
        occupancyRate: Number(occupancyRate.toFixed(2))
      },
      revenue: {
        today: Number(todayRevenue)
      },
      frontDesk: {
        todayArrivals,
        todayDepartures
      },
      housekeeping: {
        dirty: dirtyRooms,
        cleaning: cleaningRooms,
        clean: cleanRooms,
        inspected: inspectedRooms
      }
    };
  }
}
