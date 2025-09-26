import dotenv from 'dotenv';
import pkg from 'pg';
// dotenv.config({ path: './config.env' });

const { Pool } = pkg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,

});
