import { Router } from 'express';
import { query } from '../db';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const [roomCount] = await query(`SELECT COUNT(*) AS total FROM rooms`);
    const [occupiedCount] = await query(`SELECT COUNT(*) AS occupied FROM rooms WHERE current_status = 'Occupée'`);
    const [availableCount] = await query(`SELECT COUNT(*) AS available FROM rooms WHERE current_status = 'Libre'`);
    const [dirtyCount] = await query(`SELECT COUNT(*) AS dirty FROM rooms WHERE housekeeping_status = 'À nettoyer'`);
    const [maintenanceCount] = await query(`SELECT COUNT(*) AS maintenance FROM rooms WHERE maintenance_status = 'Signalé'`);
    const [revenueToday] = await query(`SELECT COALESCE(SUM(total),0) AS revenue_today FROM invoices WHERE DATE(created_at) = CURDATE()`);
    const [arrivalsCount] = await query(`SELECT COUNT(*) AS arrivals FROM reservations WHERE arrival_date = CURDATE()`);
    const [departuresCount] = await query(`SELECT COUNT(*) AS departures FROM reservations WHERE departure_date = CURDATE()`);
    const [restaurantOrdersOpen] = await query(`SELECT COUNT(*) AS orders_open FROM restaurant_orders WHERE status = 'En attente' OR status = 'En préparation'`);
    const [criticalStockAlerts] = await query(`SELECT COUNT(*) AS alerts FROM stock_items WHERE current_stock <= minimum_stock`);
    const [urgentMaintenanceTickets] = await query(`SELECT COUNT(*) AS urgent FROM maintenance_tickets WHERE priority = 'Critique' AND status != 'Résolu'`);

    res.json({
      success: true,
      data: {
        occupancyRate: roomCount.total ? Number(((occupiedCount.occupied || 0) / roomCount.total) * 100).toFixed(1) : 0,
        occupiedRooms: occupiedCount.occupied || 0,
        availableRooms: availableCount.available || 0,
        dirtyRooms: dirtyCount.dirty || 0,
        maintenanceRooms: maintenanceCount.maintenance || 0,
        revenueToday: revenueToday.revenue_today || 0,
        arrivalsCount: arrivalsCount.arrivals || 0,
        departuresCount: departuresCount.departures || 0,
        restaurantOrdersOpen: restaurantOrdersOpen.orders_open || 0,
        criticalStockAlerts: criticalStockAlerts.alerts || 0,
        urgentMaintenanceTickets: urgentMaintenanceTickets.urgent || 0
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
