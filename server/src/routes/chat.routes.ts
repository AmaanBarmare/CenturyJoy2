import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../lib/errors';
import { validateBody } from '../middleware/validate';
import { chatLimiter } from '../middleware/rateLimit.middleware';
import { answerQuery } from '../services/chat.service';

const router = Router();

const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(2000),
      }),
    )
    .min(1)
    .max(20),
});

// POST /api/chat — public support assistant
router.post(
  '/',
  chatLimiter,
  validateBody(chatSchema),
  asyncHandler(async (req, res) => {
    const { messages } = req.body as z.infer<typeof chatSchema>;
    const reply = await answerQuery(messages);
    res.json({ reply });
  }),
);

export default router;
