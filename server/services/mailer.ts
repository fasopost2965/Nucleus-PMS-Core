import nodemailer, { type Transporter } from 'nodemailer';

// Sends transactional emails (currently: password reset codes) over plain
// SMTP. Uses whatever mailbox the hotel already has — e.g. the Hostinger
// email hosting that comes with the plan — rather than a third-party
// transactional email API, so no new account/domain verification is
// required to get this working.
//
// Nothing sends anything unless all SMTP_* env vars below are set: without
// them we log a clear warning instead of silently pretending an email went
// out (previously forgot-password generated a reset code that was never
// delivered anywhere in production — see BRUNCH_BOUAKE_PMS Changelog [1.2.0]).

const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASSWORD = process.env.SMTP_PASSWORD || '';
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER;

let transporter: Transporter | null = null;

export function isMailerConfigured(): boolean {
  return !!(SMTP_HOST && SMTP_USER && SMTP_PASSWORD);
}

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASSWORD }
    });
  }
  return transporter;
}

export interface SendResult {
  sent: boolean;
  reason?: string;
}

export async function sendPasswordResetEmail(to: string, code: string, hotelName = 'Nucleus PMS'): Promise<SendResult> {
  if (!isMailerConfigured()) {
    console.warn(`[Mailer] SMTP non configuré (SMTP_HOST/SMTP_USER/SMTP_PASSWORD manquants) — code de réinitialisation NON envoyé à ${to}.`);
    return { sent: false, reason: 'SMTP_NOT_CONFIGURED' };
  }

  try {
    await getTransporter().sendMail({
      from: SMTP_FROM,
      to,
      subject: `${hotelName} — Code de réinitialisation de mot de passe`,
      text: `Votre code de réinitialisation est : ${code}\n\nCe code expire dans 15 minutes. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.`,
      html: `<p>Votre code de réinitialisation est : <strong style="font-size:1.2em">${code}</strong></p><p>Ce code expire dans 15 minutes. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>`
    });
    return { sent: true };
  } catch (err: any) {
    console.error(`[Mailer] Échec d'envoi du code de réinitialisation à ${to}:`, err.message);
    return { sent: false, reason: 'SEND_FAILED' };
  }
}
