import { Router } from 'express';
import { asyncHandler } from '../lib/errors';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { validateBody } from '../middleware/validate';
import {
  studioStatusSchema,
  deliverablePresignSchema,
  deliverableConfirmSchema,
  flagIssueSchema,
} from '../validators';
import { projectsService } from '../services/projects.service';
import { studioService } from '../services/studio.service';

const router = Router();
router.use(requireAuth, requireRole('studio', 'admin'));

// All projects (filterable)
router.get(
  '/projects',
  asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
    const status = (req.query.status as any) || undefined;
    const search = (req.query.search as string) || undefined;
    res.json(await projectsService.listAll({ status, search, page, pageSize: 20 }));
  }),
);

router.patch(
  '/projects/:id/accept',
  asyncHandler(async (req, res) => {
    res.json(await studioService.accept(req.user!, req.params.id));
  }),
);

router.patch(
  '/projects/:id/status',
  validateBody(studioStatusSchema),
  asyncHandler(async (req, res) => {
    res.json(await studioService.updateStatus(req.user!, req.params.id, req.body.toStatus));
  }),
);

router.post(
  '/projects/:id/deliverables/presign',
  validateBody(deliverablePresignSchema),
  asyncHandler(async (req, res) => {
    const uploads = await studioService.presignDeliverables(req.user!, req.params.id, req.body.views);
    res.json({ uploads });
  }),
);

router.post(
  '/projects/:id/deliverables/confirm',
  validateBody(deliverableConfirmSchema),
  asyncHandler(async (req, res) => {
    res.json(await studioService.confirmDeliverables(req.user!, req.params.id, req.body.deliverableIds));
  }),
);

router.patch(
  '/projects/:id/complete',
  asyncHandler(async (req, res) => {
    res.json(await studioService.complete(req.user!, req.params.id));
  }),
);

router.patch(
  '/projects/:id/close',
  asyncHandler(async (req, res) => {
    res.json(await studioService.close(req.user!, req.params.id));
  }),
);

router.post(
  '/projects/:id/flag',
  validateBody(flagIssueSchema),
  asyncHandler(async (req, res) => {
    res.json(await studioService.flag(req.user!, req.params.id, req.body.reason));
  }),
);

export default router;
