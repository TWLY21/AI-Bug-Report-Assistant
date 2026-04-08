import { query } from '../../config/db.js';
import { ApiError } from '../../utils/api-error.js';

export async function createReport(userId, payload) {
  const result = await query(
    `INSERT INTO reports (
      user_id, raw_input, bug_title, summary, module, environment, preconditions,
      steps_to_reproduce, expected_result, actual_result, severity, priority,
      labels, possible_root_cause, additional_notes
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7,
      $8::jsonb, $9, $10, $11, $12,
      $13::jsonb, $14, $15
    ) RETURNING *`,
    [
      userId,
      payload.rawInput,
      payload.bugTitle,
      payload.summary,
      payload.module,
      payload.environment,
      payload.preconditions,
      JSON.stringify(payload.stepsToReproduce),
      payload.expectedResult,
      payload.actualResult,
      payload.severity,
      payload.priority,
      JSON.stringify(payload.labels),
      payload.possibleRootCause,
      payload.additionalNotes,
    ]
  );

  return mapReport(result.rows[0]);
}

export async function listReports(userId, { search, severity, page, limit }) {
  const offset = (page - 1) * limit;
  const values = [userId];
  const conditions = ['user_id = $1'];

  if (search) {
    values.push(`%${search}%`);
    conditions.push(`(bug_title ILIKE $${values.length} OR summary ILIKE $${values.length})`);
  }

  if (severity) {
    values.push(severity);
    conditions.push(`severity = $${values.length}`);
  }

  values.push(limit);
  values.push(offset);

  const whereClause = conditions.join(' AND ');

  const [rowsResult, countResult] = await Promise.all([
    query(
      `SELECT * FROM reports
       WHERE ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    ),
    query(`SELECT COUNT(*)::int AS total FROM reports WHERE ${whereClause}`, values.slice(0, values.length - 2)),
  ]);

  return {
    items: rowsResult.rows.map(mapReport),
    pagination: {
      page,
      limit,
      total: countResult.rows[0].total,
    },
  };
}

export async function getReportById(userId, id) {
  const result = await query('SELECT * FROM reports WHERE id = $1 AND user_id = $2', [id, userId]);
  if (!result.rows.length) {
    throw new ApiError(404, 'Report not found');
  }
  return mapReport(result.rows[0]);
}

export async function deleteReportById(userId, id) {
  const result = await query('DELETE FROM reports WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId]);
  if (!result.rows.length) {
    throw new ApiError(404, 'Report not found');
  }
}

export async function getDashboardSummary(userId) {
  const [totalRes, severityRes, recentRes] = await Promise.all([
    query('SELECT COUNT(*)::int AS total FROM reports WHERE user_id = $1', [userId]),
    query(
      `SELECT severity, COUNT(*)::int AS count
       FROM reports
       WHERE user_id = $1
       GROUP BY severity`,
      [userId]
    ),
    query(
      `SELECT id, bug_title, severity, priority, created_at
       FROM reports
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 5`,
      [userId]
    ),
  ]);

  const defaultSeverity = {
    Low: 0,
    Medium: 0,
    High: 0,
    Critical: 0,
  };

  severityRes.rows.forEach((row) => {
    defaultSeverity[row.severity] = row.count;
  });

  return {
    totalReports: totalRes.rows[0].total,
    severityBreakdown: defaultSeverity,
    recentReports: recentRes.rows,
  };
}

function mapReport(row) {
  return {
    id: row.id,
    userId: row.user_id,
    rawInput: row.raw_input,
    bugTitle: row.bug_title,
    summary: row.summary,
    module: row.module,
    environment: row.environment,
    preconditions: row.preconditions,
    stepsToReproduce: row.steps_to_reproduce,
    expectedResult: row.expected_result,
    actualResult: row.actual_result,
    severity: row.severity,
    priority: row.priority,
    labels: row.labels,
    possibleRootCause: row.possible_root_cause,
    additionalNotes: row.additional_notes,
    createdAt: row.created_at,
  };
}
