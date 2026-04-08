import { Router } from 'express';
import { authRouter } from '../modules/auth/auth.routes.js';
import { reportsRouter } from '../modules/reports/reports.routes.js';
import { dashboardRouter } from '../modules/dashboard/dashboard.routes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/reports', reportsRouter);
apiRouter.use('/dashboard', dashboardRouter);
