import { Router } from 'express';
import { asyncHandler } from '../lib/errors';
import { requireAuth } from '../middleware/auth.middleware';
import { presignLimiter } from '../middleware/rateLimit.middleware';
import { validateBody } from '../middleware/validate';
import { confirmUploadSchema } from '../validators';
import { uploadService } from '../services/upload.service';

const router = Router();
router.use(requireAuth);

// Confirm a single uploaded project file → runs magic-byte validation
router.post(
  '/confirm',
  presignLimiter,
  validateBody(confirmUploadSchema),
  asyncHandler(async (req, res) => {
    await uploadService.confirmProjectFile(req.body.fileId, req.user!);
    res.json({ ok: true });
  }),
);

export default router;
