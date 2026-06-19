import { env } from '../config/env';

export type EmailTemplate =
  | 'account_created'
  | 'project_submitted'
  | 'project_accepted'
  | 'status_in_progress'
  | 'first_draft'
  | 'revision_requested'
  | 'revision_delivered'
  | 'project_completed'
  | 'project_closed'
  | 'password_reset'
  | 'account_locked'
  | 'studio_flagged';

const SUPPORT_EMAIL = '3DServices@centuryply.com';
const BRAND_RED = '#C8102E';

function layout(title: string, bodyHtml: string, ctaUrl?: string, ctaLabel?: string): string {
  const cta = ctaUrl
    ? `<tr><td style="padding:8px 0 24px"><a href="${ctaUrl}" style="display:inline-block;background:${BRAND_RED};color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 24px;border-radius:8px">${ctaLabel ?? 'Open Century Joy'}</a></td></tr>`
    : '';
  return `<!doctype html><html><body style="margin:0;background:#f4f1ea;font-family:Helvetica,Arial,sans-serif;color:#16120e">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ea;padding:32px 0">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;border:1px solid #eae5db">
        <tr><td style="background:#16120e;padding:22px 32px">
          <span style="font-weight:800;letter-spacing:-.5px;font-size:20px;color:${BRAND_RED}">CENTURY</span>
          <span style="font-weight:800;letter-spacing:-.5px;font-size:20px;color:#fff"> Joy</span>
        </td></tr>
        <tr><td style="padding:32px">
          <h1 style="margin:0 0 16px;font-size:22px;color:#16120e">${title}</h1>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:15px;line-height:1.6;color:#3c352d">
            ${bodyHtml}
            ${cta}
          </table>
        </td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid #eae5db;font-size:12px;color:#8c857a">
          Century Joy — Century Ply 3D Visualisation Studio<br>
          Need help? <a href="mailto:${SUPPORT_EMAIL}" style="color:${BRAND_RED}">${SUPPORT_EMAIL}</a>
        </td></tr>
      </table>
    </td></tr>
  </table></body></html>`;
}

const row = (html: string) => `<tr><td style="padding:0 0 14px">${html}</td></tr>`;
const appUrl = (path = '') => `${env.appBaseUrl}${path}`;
const projectUrl = (id?: string) => (id ? appUrl(`/app/projects/${id}`) : appUrl('/app'));

export interface RenderInput {
  template: EmailTemplate;
  payload: Record<string, unknown>;
}

/** Build the subject line for a notification (also stored on the row). */
export function buildSubject(template: EmailTemplate, p: Record<string, unknown>): string {
  const ref = (p.referenceNumber as string) || '';
  const tag = ref ? `[${ref}] ` : '';
  switch (template) {
    case 'account_created':
      return 'Welcome to Century Joy — Your Access Details';
    case 'project_submitted':
      return `${tag}New project request from ${p.clientName ?? 'a client'}`;
    case 'project_accepted':
      return `${tag}Your project has been accepted`;
    case 'status_in_progress':
      return `${tag}Work has begun on your project`;
    case 'first_draft':
      return `${tag}Your first draft is ready to view`;
    case 'revision_requested':
      return `${tag}Revision ${p.revisionNumber} requested by ${p.clientName ?? 'a client'}`;
    case 'revision_delivered':
      return `${tag}Your Revision ${p.revisionNumber} is ready`;
    case 'project_completed':
      return `${tag}Your project is complete`;
    case 'project_closed':
      return `${tag}Your project has been closed`;
    case 'password_reset':
      return 'Century Joy — Password Reset Link';
    case 'account_locked':
      return 'Century Joy — Account Temporarily Locked';
    case 'studio_flagged':
      return `${tag}Studio flagged an issue with submitted files`;
  }
}

/** Render the HTML body for a notification. Never includes presigned file URLs. */
export function renderEmail(template: EmailTemplate, p: Record<string, unknown>): string {
  const ref = (p.referenceNumber as string) || '';
  const title = (p.title as string) || ref;
  const pid = p.projectId as string | undefined;
  switch (template) {
    case 'account_created':
      return layout(
        'Welcome to Century Joy',
        row(`Hi ${p.name ?? 'there'}, an account has been created for you on Century Joy.`) +
          row(`<b>Email:</b> ${p.email}<br><b>Temporary password:</b> <code style="background:#f1ece3;padding:2px 6px;border-radius:4px">${p.tempPassword}</code>`) +
          row('For your security you will be asked to set a new password the first time you sign in.'),
        appUrl('/login'),
        'Sign in',
      );
    case 'project_submitted':
      return layout(
        'New project request',
        row(`${p.clientName} submitted a new project: <b>${title}</b> (${ref}).`) +
          row(`Views requested: ${p.numberOfViews}. Please review the submitted files in the studio dashboard.`),
        projectUrl(pid),
        'Review project',
      );
    case 'project_accepted':
      return layout(
        'Your project has been accepted',
        row(`Good news — <b>${title}</b> (${ref}) has been accepted by the studio team and work will begin shortly.`),
        projectUrl(pid),
        'View project',
      );
    case 'status_in_progress':
      return layout(
        'Work has begun',
        row(`The studio team has started work on <b>${title}</b> (${ref}). We'll let you know when your first draft is ready.`),
        projectUrl(pid),
        'View project',
      );
    case 'first_draft':
      return layout(
        'Your first draft is ready',
        row(`The first draft for <b>${title}</b> (${ref}) is ready to view. Sign in to review your rendered views and download the deliverables.`),
        projectUrl(pid),
        'View deliverables',
      );
    case 'revision_requested':
      return layout(
        `Revision ${p.revisionNumber} requested`,
        row(`${p.clientName} requested Revision ${p.revisionNumber} on <b>${title}</b> (${ref}).`) +
          (p.notes ? row(`<b>Notes:</b> ${p.notes}`) : row('No additional notes were provided.')),
        projectUrl(pid),
        'Open project',
      );
    case 'revision_delivered':
      return layout(
        `Your Revision ${p.revisionNumber} is ready`,
        row(`Revision ${p.revisionNumber} for <b>${title}</b> (${ref}) has been delivered. Sign in to review the updated views.`),
        projectUrl(pid),
        'View deliverables',
      );
    case 'project_completed':
      return layout(
        'Your project is complete',
        row(`<b>${title}</b> (${ref}) has been marked complete. Thank you for working with Century Joy.`),
        projectUrl(pid),
        'View project',
      );
    case 'project_closed':
      return layout(
        'Your project has been closed',
        row(`<b>${title}</b> (${ref}) has been closed. Your deliverables remain available to download for 90 days.`),
        projectUrl(pid),
        'View project',
      );
    case 'password_reset':
      return layout(
        'Reset your password',
        row('We received a request to reset your Century Joy password. This link expires in 30 minutes.') +
          row('If you did not request this, you can safely ignore this email.'),
        appUrl(`/reset-password?token=${p.token}`),
        'Reset password',
      );
    case 'account_locked':
      return layout(
        'Account temporarily locked',
        row('Your Century Joy account has been temporarily locked after several failed sign-in attempts. It will unlock automatically in 15 minutes.') +
          row(`If this wasn't you, please contact support at ${SUPPORT_EMAIL}.`),
      );
    case 'studio_flagged':
      return layout(
        'Studio flagged an issue',
        row(`The studio team flagged an issue with the submitted files for <b>${title}</b> (${ref}).`) +
          row(`<b>Reason:</b> ${p.reason}`),
        projectUrl(pid),
        'Open project',
      );
  }
}
