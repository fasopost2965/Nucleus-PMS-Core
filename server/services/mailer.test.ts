import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const sendMailMock = vi.fn();
const createTransportMock = vi.fn(() => ({ sendMail: sendMailMock }));

vi.mock('nodemailer', () => ({
  default: { createTransport: (...args: unknown[]) => createTransportMock(...args) }
}));

const ORIGINAL_ENV = { ...process.env };

async function loadMailerWithEnv(env: Record<string, string | undefined>) {
  vi.resetModules();
  for (const key of ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD', 'SMTP_FROM']) {
    delete process.env[key];
  }
  Object.assign(process.env, env);
  return import('./mailer');
}

describe('mailer', () => {
  beforeEach(() => {
    sendMailMock.mockReset();
    createTransportMock.mockClear();
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it('reports not configured, and never calls nodemailer, when SMTP env vars are missing', async () => {
    const { isMailerConfigured, sendPasswordResetEmail } = await loadMailerWithEnv({});

    expect(isMailerConfigured()).toBe(false);

    const result = await sendPasswordResetEmail('guest@example.com', '123456');

    expect(result).toEqual({ sent: false, reason: 'SMTP_NOT_CONFIGURED' });
    expect(createTransportMock).not.toHaveBeenCalled();
    expect(sendMailMock).not.toHaveBeenCalled();
  });

  it('sends the reset code by email once SMTP is configured', async () => {
    sendMailMock.mockResolvedValue({ messageId: 'abc' });
    const { isMailerConfigured, sendPasswordResetEmail } = await loadMailerWithEnv({
      SMTP_HOST: 'smtp.example.com',
      SMTP_USER: 'no-reply@example.com',
      SMTP_PASSWORD: 'secret'
    });

    expect(isMailerConfigured()).toBe(true);

    const result = await sendPasswordResetEmail('guest@example.com', '654321', 'Brunch Bouaké');

    expect(result).toEqual({ sent: true });
    expect(sendMailMock).toHaveBeenCalledOnce();
    const call = sendMailMock.mock.calls[0][0];
    expect(call.to).toBe('guest@example.com');
    expect(call.text).toContain('654321');
    expect(call.subject).toContain('Brunch Bouaké');
  });

  it('returns a SEND_FAILED result instead of throwing when the SMTP send rejects', async () => {
    sendMailMock.mockRejectedValue(new Error('connection refused'));
    const { sendPasswordResetEmail } = await loadMailerWithEnv({
      SMTP_HOST: 'smtp.example.com',
      SMTP_USER: 'no-reply@example.com',
      SMTP_PASSWORD: 'secret'
    });

    const result = await sendPasswordResetEmail('guest@example.com', '111111');

    expect(result.sent).toBe(false);
    expect(result.reason).toBe('SEND_FAILED');
  });
});
