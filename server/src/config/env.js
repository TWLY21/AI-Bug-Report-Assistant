import dotenv from 'dotenv';

dotenv.config();

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function requiredAny(names) {
  for (const name of names) {
    const value = process.env[name];
    if (value) {
      return value;
    }
  }
  throw new Error(`Missing required environment variable. Set one of: ${names.join(', ')}`);
}

function numberOrDefault(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  databaseUrl: required('DATABASE_URL'),
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  geminiApiKey: requiredAny(['GEMINI_API_KEY', 'OPENAI_API_KEY']),
  geminiModel: process.env.GEMINI_MODEL || process.env.OPENAI_MODEL || 'gemini-2.5-flash',
  geminiBaseUrl:
    process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta/openai/',
  geminiTimeoutMs: numberOrDefault(process.env.GEMINI_TIMEOUT_MS, 20000),
  geminiMaxRetries: Math.max(0, numberOrDefault(process.env.GEMINI_MAX_RETRIES, 2)),
  aiFallbackMode: process.env.AI_FALLBACK_MODE || 'heuristic',
};
