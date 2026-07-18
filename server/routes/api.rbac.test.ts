import { describe, it, expect, beforeAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import apiRouter from './api';
import { generateToken } from '../config/jwt';

// These tests exercise the REAL router exactly as server.ts mounts it, so any
// regression in the requireRole(...) wiring on a route is caught here. Every
// case below asserts a 403 (role rejected), which happens in the requireRole
// middleware *before* the route handler runs — so none of these requests ever
// reach server/config/db.ts, and the repo's committed server/data/pms_database.json
// fixture is never read or written by this suite.

function tokenFor(role: string): string {
  return generateToken({ id: 999, email: 'test@example.com', role, name: 'Test User' });
}

let app: express.Express;

beforeAll(() => {
  app = express();
  app.use(express.json());
  app.use('/api', apiRouter);
});

type Case = { method: 'post' | 'put' | 'delete'; path: string; deniedRole: string; label: string };

const cases: Case[] = [
  { method: 'post', path: '/api/rooms', deniedRole: 'Réceptionniste', label: 'create room' },
  { method: 'put', path: '/api/rooms/room-1', deniedRole: 'Housekeeping', label: 'update room' },
  { method: 'put', path: '/api/rooms/room-1/status', deniedRole: 'Housekeeping', label: 'update room status' },
  { method: 'delete', path: '/api/rooms/room-1', deniedRole: 'Réceptionniste', label: 'delete room' },
  { method: 'put', path: '/api/room_categories', deniedRole: 'Réceptionniste', label: 'update room categories/pricing' },
  { method: 'put', path: '/api/settings/hotel', deniedRole: 'Réceptionniste', label: 'update hotel settings' },
  { method: 'post', path: '/api/guests', deniedRole: 'Housekeeping', label: 'create guest' },
  { method: 'put', path: '/api/guests/guest-1', deniedRole: 'Technicien Maintenance', label: 'update guest' },
  { method: 'post', path: '/api/reservations', deniedRole: 'Magasinier / Stock', label: 'create reservation' },
  { method: 'post', path: '/api/reservations/res-1/check-in', deniedRole: 'Housekeeping', label: 'check-in' },
  { method: 'post', path: '/api/reservations/res-1/check-out', deniedRole: 'Housekeeping', label: 'check-out' },
  { method: 'post', path: '/api/finance/payments', deniedRole: 'Housekeeping', label: 'record payment' },
  { method: 'post', path: '/api/hrms/employees', deniedRole: 'Réceptionniste', label: 'create HR employee' },
  { method: 'put', path: '/api/hrms/employees/emp-1', deniedRole: 'Réceptionniste', label: 'update HR employee' },
  { method: 'post', path: '/api/hrms/departments', deniedRole: 'Réceptionniste', label: 'create HR department' },
  { method: 'post', path: '/api/hrms/jobs', deniedRole: 'Réceptionniste', label: 'create HR job' },
  { method: 'post', path: '/api/hrms/teams', deniedRole: 'Réceptionniste', label: 'create HR team' },
  { method: 'post', path: '/api/hrms/contracts', deniedRole: 'Réceptionniste', label: 'create HR contract' },
  { method: 'put', path: '/api/hrms/contracts/contract-1', deniedRole: 'Réceptionniste', label: 'update HR contract' },
  { method: 'put', path: '/api/hrms/onboarding-tasks/task-1', deniedRole: 'Réceptionniste', label: 'update onboarding task' }
];

describe('RBAC enforcement on write endpoints (server/routes/api.ts)', () => {
  for (const { method, path, deniedRole, label } of cases) {
    it(`rejects "${deniedRole}" with 403 on ${method.toUpperCase()} ${path} (${label})`, async () => {
      const res = await request(app)
        [method](path)
        .set('Authorization', `Bearer ${tokenFor(deniedRole)}`)
        .send({});

      expect(res.status).toBe(403);
      expect(res.body).toMatchObject({ success: false, error: { code: 'FORBIDDEN' } });
    });
  }

  it('rejects a fully unauthenticated request with 401 before any role check', async () => {
    const res = await request(app).post('/api/rooms').send({});
    expect(res.status).toBe(401);
  });

  it('lets an allowed role (Super Administrateur) past the RBAC gate on POST /api/rooms', async () => {
    // Empty body: the handler validates required fields *before* touching the
    // database, so this proves the role check passed without writing any data.
    const res = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${tokenFor('Super Administrateur')}`)
      .send({});

    expect(res.status).not.toBe(403);
    expect(res.status).toBe(400);
  });

  it('rejects PUT /api/rooms/:id/status with no recognized status field, before touching the DB', async () => {
    const res = await request(app)
      .put('/api/rooms/room-1/status')
      .set('Authorization', `Bearer ${tokenFor('Réceptionniste')}`)
      .send({ base_price: 999999 }); // not a whitelisted status field

    expect(res.status).toBe(400);
  });

  it('lets an allowed role (Réceptionniste) past the RBAC gate on PUT /api/rooms/:id/status', async () => {
    // Nonexistent room id: db.update returns null (404) before ever calling
    // saveCollection, so this proves the role check passed without writing.
    const res = await request(app)
      .put('/api/rooms/does-not-exist/status')
      .set('Authorization', `Bearer ${tokenFor('Réceptionniste')}`)
      .send({ current_status: 'Occupée' });

    expect(res.status).not.toBe(403);
    expect(res.status).toBe(404);
  });

  it('lets an allowed role (Réceptionniste) past the RBAC gate on POST /api/reservations', async () => {
    const res = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${tokenFor('Réceptionniste')}`)
      .send({});

    expect(res.status).not.toBe(403);
    expect(res.status).toBe(400);
  });

  it('lets an allowed role (Réceptionniste) past the RBAC gate on POST /api/reservations/:id/check-out', async () => {
    // Nonexistent reservation id: db.getById is a pure read, so this proves
    // the role check passed without ever calling runTransaction (no write).
    const res = await request(app)
      .post('/api/reservations/does-not-exist/check-out')
      .set('Authorization', `Bearer ${tokenFor('Réceptionniste')}`)
      .send({});

    expect(res.status).not.toBe(403);
    expect(res.status).toBe(404);
  });
});
