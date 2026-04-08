import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../../config/db.js';
import { env } from '../../config/env.js';
import { ApiError } from '../../utils/api-error.js';

function signToken(userId) {
  return jwt.sign({}, env.jwtSecret, {
    subject: String(userId),
    expiresIn: env.jwtExpiresIn,
  });
}

export async function registerUser({ name, email, password }) {
  const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
  if (existing.rows.length) {
    throw new ApiError(409, 'Email is already registered');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const result = await query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, created_at`,
    [name.trim(), email.toLowerCase(), passwordHash]
  );

  const user = result.rows[0];
  const token = signToken(user.id);

  return { user, token };
}

export async function loginUser({ email, password }) {
  const result = await query('SELECT id, name, email, password_hash, created_at FROM users WHERE email = $1', [
    email.toLowerCase(),
  ]);

  if (!result.rows.length) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const userRow = result.rows[0];
  const ok = await bcrypt.compare(password, userRow.password_hash);

  if (!ok) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = signToken(userRow.id);

  return {
    user: {
      id: userRow.id,
      name: userRow.name,
      email: userRow.email,
      created_at: userRow.created_at,
    },
    token,
  };
}
