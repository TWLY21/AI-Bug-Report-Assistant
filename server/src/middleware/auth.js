import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { query } from '../config/db.js';
import { ApiError } from '../utils/api-error.js';

export async function requireAuth(req, _res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Unauthorized'));
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const result = await query('SELECT id, name, email FROM users WHERE id = $1', [payload.sub]);

    if (!result.rows.length) {
      return next(new ApiError(401, 'Unauthorized'));
    }

    req.user = result.rows[0];
    return next();
  } catch {
    return next(new ApiError(401, 'Invalid or expired token'));
  }
}
