// Test environment bootstrap. Runs before any test file's imports are
// evaluated (see vitest.config.ts `setupFiles`), so JWT_SECRET is already
// present when server/config/jwt.ts runs its top-level check.
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-only-secret-do-not-use-in-production';
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
