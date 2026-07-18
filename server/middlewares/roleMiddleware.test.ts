import { describe, it, expect, vi } from 'vitest';
import { requireRole } from './roleMiddleware';
import type { AuthenticatedRequest } from './authMiddleware';
import type { Response } from 'express';

function fakeRes() {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
}

describe('requireRole middleware', () => {
  it('calls next() when the user role is in the allowed list', () => {
    const req = { user: { id: 1, email: 'a@a.com', role: 'Directeur' } } as AuthenticatedRequest;
    const res = fakeRes();
    const next = vi.fn();

    requireRole('Super Administrateur', 'Directeur')(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('rejects with 403 when the user role is not in the allowed list', () => {
    const req = { user: { id: 2, email: 'b@b.com', role: 'Housekeeping' } } as AuthenticatedRequest;
    const res = fakeRes();
    const next = vi.fn();

    requireRole('Super Administrateur', 'Directeur')(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, error: expect.objectContaining({ code: 'FORBIDDEN' }) })
    );
  });

  it('rejects with 403 when req.user is missing entirely', () => {
    const req = {} as AuthenticatedRequest;
    const res = fakeRes();
    const next = vi.fn();

    requireRole('Super Administrateur')(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('rejects a role that is a case-sensitive near-match (no fuzzy matching)', () => {
    const req = { user: { id: 3, email: 'c@c.com', role: 'directeur' } } as AuthenticatedRequest;
    const res = fakeRes();
    const next = vi.fn();

    requireRole('Directeur')(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
