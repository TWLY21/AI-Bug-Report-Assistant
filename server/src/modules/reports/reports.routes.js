import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import {
  generateReport,
  saveReport,
  getReports,
  getReport,
  deleteReport,
} from './reports.controller.js';
import {
  generateReportSchema,
  saveReportSchema,
  listReportsQuerySchema,
  reportIdParamSchema,
} from './reports.validation.js';

export const reportsRouter = Router();

reportsRouter.use(requireAuth);

reportsRouter.post('/generate', validate({ body: generateReportSchema }), generateReport);
reportsRouter.post('/', validate({ body: saveReportSchema }), saveReport);
reportsRouter.get('/', validate({ query: listReportsQuerySchema }), getReports);
reportsRouter.get('/:id', validate({ params: reportIdParamSchema }), getReport);
reportsRouter.delete('/:id', validate({ params: reportIdParamSchema }), deleteReport);
