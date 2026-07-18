import { describe, it, expect, beforeAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import apiRouter from './api';

// Only exercises the "unknown email" branch, which is a pure read
// (db.getCollection('users')) with no write — safe against the repo's
// committed server/data/pms_database.json fixture regardless of its content,
// since the email below cannot plausibly match a seeded account.

let app: express.Express;

beforeAll(() => {
  app = express();
  app.use(express.json());
  app.use('/api', apiRouter);
});

describe('POST /api/auth/forgot-password', () => {
  it('returns a generic 200 response for an email that has no account (no enumeration oracle)', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'definitely-not-a-real-account-xyz@example.invalid' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.devCode).toBeUndefined();
  });

  it('rejects a request with no email at all', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({});
    expect(res.status).toBe(400);
  });
});
