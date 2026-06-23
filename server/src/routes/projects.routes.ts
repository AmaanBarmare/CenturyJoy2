import { Router } from 'express';
import { asyncHandler } from '../lib/errors';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { validateBody } from '../middleware/validate';
import { createProjectLimiter } from '../middleware/rateLimit.middleware';
import { createProjectSchema, requestRevisionSchema } from '../validators';
import { projectsService } from '../services/projects.service';

const router = Router();
router.use(requireAuth);

// List own projects (paginated) + summary counts
router.get(
  '/',
  requireRole('client', 'admin'),
  asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
    const data = await projectsService.listForClient(req.user!, page);
    res.json(data);
  }),
);

router.get(
  '/summary',
  requireRole('client', 'admin'),
  asyncHandler(async (req, res) => {
    res.json(await projectsService.clientSummary(req.user!));
  }),
);

// Create a new project (metadata + file list) → returns presigned upload URLs
router.post(
  '/',
  requireRole('client', 'admin'),
  createProjectLimiter,
  validateBody(createProjectSchema),
  asyncHandler(async (req, res) => {
    const data = await projectsService.create(req.user!, req.body);
    res.status(201).json(data);
  }),
);

// Project detail (files + deliverables + history + revisions) — any role with access
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    res.json(await projectsService.getDetail(req.user!, req.params.id));
  }),
);

// Notify studio that all uploads are complete
router.post(
  '/:id/submit',
  requireRole('client', 'admin'),
  asyncHandler(async (req, res) => {
    await projectsService.notifySubmitted(req.user!, req.params.id);
    res.json({ ok: true });
  }),
);

// Request a revision (max 2)
router.post(
  '/:id/revision',
  requireRole('client', 'admin'),
  validateBody(requestRevisionSchema),
  asyncHandler(async (req, res) => {
    res.json(await projectsService.requestRevision(req.user!, req.params.id, req.body.notes));
  }),
);

export default router;
