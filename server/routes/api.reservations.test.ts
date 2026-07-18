import { describe, it, expect, beforeAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import apiRouter from './api';
import { generateToken } from '../config/jwt';

// Validation-chain checks for POST /api/reservations. Each case here is
// designed to be rejected before any database write (bad input shape, or a
// room id that cannot possibly exist), so this suite never mutates the
// repo's committed server/data/pms_database.json fixture. The pricing/
// overlap business logic itself is covered in isolation by
// server/services/reservationPricing.test.ts.

function receptionToken(): string {
  return generateToken({ id: 1, email: 'reception@example.com', role: 'Réceptionniste', name: 'Test Reception' });
}

let app: express.Express;

beforeAll(() => {
  app = express();
  app.use(express.json());
  app.use('/api', apiRouter);
});

describe('POST /api/reservations validation', () => {
  it('rejects a payload missing required fields', async () => {
    const res = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${receptionToken()}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it('rejects an unparsable arrival/departure date', async () => {
    const res = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${receptionToken()}`)
      .send({ guest_id: 'guest-1', room_id: 'room-1', arrival_date: 'not-a-date', departure_date: '2026-08-05' });

    expect(res.status).toBe(400);
  });

  it('rejects an arrival date on/after the departure date', async () => {
    const res = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${receptionToken()}`)
      .send({ guest_id: 'guest-1', room_id: 'room-1', arrival_date: '2026-08-10', departure_date: '2026-08-05' });

    expect(res.status).toBe(400);
  });

  it('rejects a room_id that does not exist, without ever reaching a DB write', async () => {
    const res = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${receptionToken()}`)
      .send({
        guest_id: 'guest-1',
        room_id: 'room-that-does-not-exist-xyz',
        arrival_date: '2026-08-01',
        departure_date: '2026-08-05'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
