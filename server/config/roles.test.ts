import { describe, it, expect } from 'vitest';
import { ADMIN_ROLES, RECEPTION_ROLES, FALLBACK_ROLE, resolveRole } from './roles';

describe('roles config', () => {
  it('ADMIN_ROLES contains exactly the two administrative roles', () => {
    expect(ADMIN_ROLES).toEqual(['Super Administrateur', 'Directeur']);
  });

  it('RECEPTION_ROLES extends ADMIN_ROLES with Réceptionniste', () => {
    expect(RECEPTION_ROLES).toEqual(['Super Administrateur', 'Directeur', 'Réceptionniste']);
  });

  it('FALLBACK_ROLE is not part of any privileged role group', () => {
    expect(ADMIN_ROLES).not.toContain(FALLBACK_ROLE);
    expect(RECEPTION_ROLES).not.toContain(FALLBACK_ROLE);
  });

  describe('resolveRole', () => {
    it('returns the user role when present', () => {
      expect(resolveRole({ role: 'Housekeeping' })).toBe('Housekeeping');
    });

    it('fails closed to FALLBACK_ROLE when role is missing', () => {
      expect(resolveRole({})).toBe(FALLBACK_ROLE);
    });

    it('fails closed to FALLBACK_ROLE when role is null', () => {
      expect(resolveRole({ role: null })).toBe(FALLBACK_ROLE);
    });

    it('fails closed to FALLBACK_ROLE when role is an empty string', () => {
      expect(resolveRole({ role: '' })).toBe(FALLBACK_ROLE);
    });

    it('never resolves a role-less user to an admin role', () => {
      const resolved = resolveRole({});
      expect(ADMIN_ROLES).not.toContain(resolved);
    });
  });
});
