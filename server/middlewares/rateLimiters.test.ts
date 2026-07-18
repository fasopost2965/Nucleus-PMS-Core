import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import { createAuthRateLimiter } from './rateLimiters';

// Uses a small explicit limit/window instead of the 15-minute production
// default so the test is fast and deterministic.
function buildApp(limit: number) {
  const app = express();
  app.use(createAuthRateLimiter('Trop de tentatives.', { windowMs: 60_000, limit }));
  app.post('/probe', (req, res) => res.status(200).json({ success: true }));
  return app;
}

describe('createAuthRateLimiter', () => {
  it('allows requests up to the configured limit', async () => {
    const app = buildApp(3);
    for (let i = 0; i < 3; i++) {
      const res = await request(app).post('/probe');
      expect(res.status).toBe(200);
    }
  });

  it('rejects with 429 once the limit is exceeded', async () => {
    const app = buildApp(3);
    for (let i = 0; i < 3; i++) {
      await request(app).post('/probe');
    }
    const res = await request(app).post('/probe');
    expect(res.status).toBe(429);
    expect(res.body).toMatchObject({ success: false, error: { code: 'TOO_MANY_REQUESTS' } });
  });

  it('uses the custom message passed to the factory', async () => {
    const app = express();
    app.use(createAuthRateLimiter('Message personnalisé.', { windowMs: 60_000, limit: 1 }));
    app.post('/probe', (req, res) => res.status(200).json({ success: true }));

    await request(app).post('/probe');
    const res = await request(app).post('/probe');

    expect(res.status).toBe(429);
    expect(res.body.error.message).toBe('Message personnalisé.');
  });

  it('defaults to 10 requests per 15 minutes when no options are given', async () => {
    const app = express();
    app.use(createAuthRateLimiter('Default window test'));
    app.post('/probe', (req, res) => res.status(200).json({ success: true }));

    for (let i = 0; i < 10; i++) {
      const res = await request(app).post('/probe');
      expect(res.status).toBe(200);
    }
    const res = await request(app).post('/probe');
    expect(res.status).toBe(429);
  });
});
