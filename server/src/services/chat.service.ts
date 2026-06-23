import { env } from '../config/env';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

// Cheap, fast, and currently available — right-sized for a support/FAQ bot.
const MODEL = 'gpt-4o-mini';

/** Everything the assistant is allowed to know about Century Joy. */
const SYSTEM_PROMPT = `You are the Century Joy assistant, a helpful support guide on the Century Joy website.

ABOUT
Century Joy is a closed, invite-only photorealistic 3D visualisation service by Century Plyboards (India) Ltd. It turns architects' and interior designers' sketches, drawings and project models into photorealistic renders so they can present ideas with clarity, impact and confidence. Tagline: "Your vision. Our visual expertise." It is for architects, interior designers and design influencers.

SERVICES
- Interior Rendering — realistic interior visuals (living spaces, bedrooms, kitchens, luxury interiors).
- Exterior Rendering — residential, commercial and facade studies with realistic surroundings, materials and finishes.
- Material & Finish Visualisation — see colours, textures and finishes rendered true to life.
- Presentation Visuals — polished visuals for client meetings, proposals and presentations.

HOW IT WORKS (6 steps)
1. Register & Access — receive an invite and sign in to the Century Joy portal.
2. Submit Request — share project details, requirements and expected outcomes.
3. Upload Materials — upload drawings, plans and reference images (.DWG, PDF, JPG).
4. Visualisation — the studio team builds realistic renders from your brief.
5. Review & Revise — review the draft and request up to two revisions.
6. Final Delivery — download your completed high-resolution renders.

FAQ
- Projects accepted: residential, commercial, hospitality and architectural visualisation.
- Files you can upload: CAD drawings (.dwg), PDFs, and reference images (.jpg).
- Revisions: each project includes up to two revision rounds, tracked on your dashboard.
- Tracking: every status update is visible in the portal, with email notifications at each milestone.
- Access: the portal is invite-only. New users can request access; existing partners log in.

CONTACT
- Email: 3DServices@centuryply.com
- Phone: 9004901699
- Support hours: 9:30 AM to 5:30 PM IST

RULES
- Only answer questions about Century Joy, its services, the process, files, revisions, access, and contact details.
- Be concise, warm and professional. Plain sentences, no emojis, no markdown headings.
- If you do not know something (pricing, exact turnaround times, account-specific status), say so plainly and point the person to 3DServices@centuryply.com.
- Never invent prices, deadlines, or policies that are not stated above.
- For "how do I get access" type questions, tell them to use "Request access" on the site or email the team.`;

/** Send the conversation to OpenAI and return the assistant's reply text. */
export async function answerQuery(history: ChatMessage[]): Promise<string> {
  if (!env.openaiApiKey) {
    throw new AppError(
      503,
      'The assistant is not configured yet. Please email 3DServices@centuryply.com.',
      'chat_unavailable',
    );
  }

  // Cap the history we forward to keep token cost predictable.
  const trimmed = history.slice(-12);
  const messages = [
    { role: 'system' as const, content: SYSTEM_PROMPT },
    ...trimmed.map((m) => ({ role: m.role, content: m.content })),
  ];

  let resp: Response;
  try {
    resp = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: 0.3,
        max_tokens: 500,
      }),
    });
  } catch (err) {
    logger.error('OpenAI request failed', {
      message: err instanceof Error ? err.message : String(err),
    });
    throw new AppError(502, 'The assistant is unavailable right now. Please try again shortly.', 'chat_upstream');
  }

  if (!resp.ok) {
    const body = await resp.text().catch(() => '');
    logger.error('OpenAI error response', { status: resp.status, body: body.slice(0, 500) });
    throw new AppError(502, 'The assistant is unavailable right now. Please try again shortly.', 'chat_upstream');
  }

  const data = (await resp.json()) as { choices?: { message?: { content?: string } }[] };
  const reply = data.choices?.[0]?.message?.content?.trim();
  if (!reply) {
    throw new AppError(502, 'The assistant returned an empty response. Please try again.', 'chat_empty');
  }
  return reply;
}
