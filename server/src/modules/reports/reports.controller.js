import { asyncHandler } from '../../utils/async-handler.js';
import { generateStructuredReport } from './ai.service.js';
import { createReport, listReports, getReportById, deleteReportById } from './reports.service.js';

export const generateReport = asyncHandler(async (req, res) => {
  const result = await generateStructuredReport(req.body.rawInput);
  res.json(result);
});

export const saveReport = asyncHandler(async (req, res) => {
  const report = await createReport(req.user.id, req.body);
  res.status(201).json({ report });
});

export const getReports = asyncHandler(async (req, res) => {
  const result = await listReports(req.user.id, req.query);
  res.json(result);
});

export const getReport = asyncHandler(async (req, res) => {
  const report = await getReportById(req.user.id, req.params.id);
  res.json({ report });
});

export const deleteReport = asyncHandler(async (req, res) => {
  await deleteReportById(req.user.id, req.params.id);
  res.status(204).send();
});
