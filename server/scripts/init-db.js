import fs from 'node:fs/promises';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('Missing DATABASE_URL in environment.');
  process.exit(1);
}

const sqlPath = new URL('../sql/init.sql', import.meta.url);
const sql = await fs.readFile(sqlPath, 'utf8');

const { Pool } = pg;
const pool = new Pool({ connectionString });

try {
  await pool.query(sql);
  console.log('Database schema initialized successfully.');
} catch (error) {
  console.error('Failed to initialize schema:', error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
