import { Resend } from 'resend';
import { supabase } from '../lib/supabase';
import { env } from '../config/env';
import { logger } from '../lib/logger';
import {
  buildSubject,
  renderEmail,
  type EmailTemplate,
} from '../lib/emailTemplates';

const resend = env.resendApiKey ? new Resend(env.resendApiKey) : null;
const MAX_RETRIES = 5;

export interface EnqueueInput {
  template: EmailTemplate;
  recipientEmail: string;
  payload: Record<string, unknown>;
  projectId?: string | null;
}

/**
 * Write a notification row with status='pending' and return immediately.
 * Email is NEVER sent inside a request handler (PRD A9) — the worker drains it.
 */
export async function enqueueEmail(input: EnqueueInput): Promise<void> {
  const subject = buildSubject(input.template, input.payload);
  const { error } = await supabase.from('email_notifications').insert({
    recipient_email: input.recipientEmail,
    subject,
    template: input.template,
    payload: input.payload,
    project_id: input.projectId ?? null,
    status: 'pending',
  });
  if (error) logger.error('Failed to enqueue email', { template: input.template, error: error.message });
}

interface EmailRow {
  id: string;
  recipient_email: string;
  subject: string;
  template: EmailTemplate;
  payload: Record<string, unknown> | null;
  retry_count: number;
}

/** Drain pending notifications. Called every 60s by the worker. */
export async function drainPendingEmails(): Promise<void> {
  const { data, error } = await supabase
    .from('email_notifications')
    .select('id, recipient_email, subject, template, payload, retry_count')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(25);

  if (error) {
    logger.error('Failed to read pending emails', { error: error.message });
    return;
  }
  const rows = (data as EmailRow[]) ?? [];
  for (const row of rows) await sendOne(row);
}

async function sendOne(row: EmailRow): Promise<void> {
  const html = renderEmail(row.template, row.payload ?? {});

  if (!resend) {
    // No Resend key configured — log instead of failing, so the rest works in dev.
    logger.warn('RESEND_API_KEY not set; skipping send', {
      to: maskEmail(row.recipient_email),
      template: row.template,
    });
    await supabase
      .from('email_notifications')
      .update({ status: 'sent', sent_at: new Date().toISOString(), error_message: 'skipped: no RESEND_API_KEY' })
      .eq('id', row.id);
    return;
  }

  try {
    const { error } = await resend.emails.send({
      from: env.emailFrom,
      to: row.recipient_email,
      subject: row.subject,
      html,
    });
    if (error) throw new Error(error.message);
    await supabase
      .from('email_notifications')
      .update({ status: 'sent', sent_at: new Date().toISOString(), error_message: null })
      .eq('id', row.id);
    logger.info('Email sent', { template: row.template });
  } catch (err) {
    const retry = row.retry_count + 1;
    const message = err instanceof Error ? err.message : String(err);
    const dead = retry >= MAX_RETRIES;
    await supabase
      .from('email_notifications')
      .update({ status: dead ? 'dead' : 'pending', retry_count: retry, error_message: message })
      .eq('id', row.id);
    logger.error('Email send failed', { template: row.template, retry, dead });
    if (dead) await alertAdminDeadLetter(row, message);
  }
}

async function alertAdminDeadLetter(row: EmailRow, message: string): Promise<void> {
  if (!resend || !env.adminAlertEmail) return;
  try {
    await resend.emails.send({
      from: env.emailFrom,
      to: env.adminAlertEmail,
      subject: 'Century Joy — Email delivery failed (dead-letter)',
      html: `<p>A notification could not be delivered after ${MAX_RETRIES} attempts.</p>
             <p>Template: ${row.template}<br>To: ${maskEmail(row.recipient_email)}<br>Error: ${message}</p>`,
    });
  } catch {
    /* swallow — nothing more we can do */
  }
}

function maskEmail(email: string): string {
  const [u, d] = email.split('@');
  if (!d) return '***';
  return `${u.slice(0, 2)}***@${d}`;
}
