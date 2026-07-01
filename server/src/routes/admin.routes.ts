import { Router } from 'express';
import { asyncHandler } from '../lib/errors';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { validateBody } from '../middleware/validate';
import {
  adminCreateUserSchema,
  adminUpdateUserSchema,
  adminOverrideStatusSchema,
} from '../validators';
import { adminService } from '../services/admin.service';
import { projectsService } from '../services/projects.service';
import { badRequest } from '../lib/errors';

const router = Router();
router.use(requireAuth, requireRole('admin'));

// ── Users ───────────────────────────────────────────────
router.get('/users', asyncHandler(async (_req, res) => res.json({ users: await adminService.listUsers() })));

router.post(
  '/users',
  validateBody(adminCreateUserSchema),
  asyncHandler(async (req, res) => res.status(201).json(await adminService.createUser(req.body, req.user!))),
);

router.patch(
  '/users/:id',
  validateBody(adminUpdateUserSchema),
  asyncHandler(async (req, res) => res.json({ user: await adminService.updateUser(req.params.id, req.body, req.user!) })),
);

router.post(
  '/users/:id/reset-password',
  asyncHandler(async (req, res) => res.json(await adminService.resetPassword(req.params.id, req.user!))),
);

router.patch(
  '/users/:id/deactivate',
  asyncHandler(async (req, res) => res.json({ user: await adminService.deactivate(req.params.id, req.user!) })),
);

router.patch(
  '/users/:id/reactivate',
  asyncHandler(async (req, res) => res.json({ user: await adminService.reactivate(req.params.id, req.user!) })),
);

// ── Project oversight ───────────────────────────────────
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
  '/projects/:id/status',
  validateBody(adminOverrideStatusSchema),
  asyncHandler(async (req, res) => {
    res.json(await adminService.overrideStatus(req.params.id, req.body.toStatus, req.body.reason, req.user!));
  }),
);

router.patch(
  '/projects/:id/delete',
  asyncHandler(async (req, res) => res.json(await adminService.softDelete(req.params.id, req.user!))),
);

// ── Clients (mini-CRM) ──────────────────────────────────
router.get('/clients', asyncHandler(async (_req, res) => res.json({ clients: await adminService.listClients() })));
router.get('/clients/:id', asyncHandler(async (req, res) => res.json(await adminService.clientDetail(req.params.id))));

// ── Analytics ───────────────────────────────────────────
router.get('/analytics', asyncHandler(async (_req, res) => res.json(await adminService.analytics())));

// ── Production board + Delivery queue ───────────────────
router.get('/board', asyncHandler(async (_req, res) => res.json(await adminService.board())));

// ── Audit log ───────────────────────────────────────────
router.get(
  '/audit-log',
  asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
    res.json(
      await adminService.auditLog({
        userId: (req.query.userId as string) || undefined,
        action: (req.query.action as string) || undefined,
        from: (req.query.from as string) || undefined,
        to: (req.query.to as string) || undefined,
        page,
      }),
    );
  }),
);

router.get(
  '/audit-log/export',
  asyncHandler(async (req, res) => {
    const from = req.query.from as string;
    const to = req.query.to as string;
    if (!from || !to) throw badRequest('A date range (from, to) is required for export.');
    const csv = await adminService.auditExportCsv(from, to);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="century-joy-audit-log.csv"');
    res.send(csv);
  }),
);

export default router;
