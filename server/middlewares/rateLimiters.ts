import rateLimit, { type Options } from 'express-rate-limit';

export interface AuthRateLimiterOptions {
  windowMs?: number;
  limit?: number;
}

/**
 * Shared factory for the auth-endpoint rate limiters (login, forgot-password,
 * reset-password). Defaults match the original login limiter: 10 requests
 * per 15 minutes per IP. Options are overridable so tests can use a small
 * window/limit instead of waiting on the real 15-minute production window.
 */
export function createAuthRateLimiter(message: string, options: AuthRateLimiterOptions = {}): ReturnType<typeof rateLimit> {
  const config: Partial<Options> = {
    windowMs: options.windowMs ?? 15 * 60 * 1000,
    limit: options.limit ?? 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: { message, code: 'TOO_MANY_REQUESTS' }
    }
  };
  return rateLimit(config);
}
