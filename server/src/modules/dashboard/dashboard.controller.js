import { asyncHandler } from '../../utils/async-handler.js';
import { getDashboardSummary } from '../reports/reports.service.js';

export const summary = asyncHandler(async (req, res) => {
  const data = await getDashboardSummary(req.user.id);
  res.json(data);
});
