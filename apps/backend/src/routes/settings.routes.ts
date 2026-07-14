import { Router } from 'express';
import { SettingsController } from '../controllers/settings.controller';
import { authenticate } from '../middlewares/authMiddleware';
import { requirePermission } from '../middlewares/rbacMiddleware';

const router = Router();
const settingsController = new SettingsController();

/**
 * @openapi
 * /settings:
 *   get:
 *     summary: Get hotel settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Settings retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  '/',
  authenticate,
  requirePermission('read', 'settings'),
  settingsController.getSettings
);

/**
 * @openapi
 * /settings:
 *   put:
 *     summary: Update hotel settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currency:
 *                 type: string
 *               timezone:
 *                 type: string
 *               vatRate:
 *                 type: number
 *               tourismTaxRate:
 *                 type: number
 *               invoicePrefix:
 *                 type: string
 *     responses:
 *       200:
 *         description: Settings updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put(
  '/',
  authenticate,
  requirePermission('manage', 'settings'),
  settingsController.updateSettings
);

export const settingsRoutes = router;
