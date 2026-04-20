import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

// Connection pool configuration
const poolConfig: pg.PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection cannot be established
};

// SSL configuration for production
if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost')) {
  poolConfig.ssl = { rejectUnauthorized: false };
}

// Create the connection pool
export const pool = new Pool(poolConfig);

// Initialize database schema
export async function initializeDatabase(): Promise<boolean> {
  if (!process.env.DATABASE_URL) {
    console.log('DATABASE_URL not set, skipping database initialization');
    return false;
  }

  try {
    // Test connection
    const client = await pool.connect();
    console.log('PostgreSQL connection established');
    client.release();

    // Run schema migration
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf-8');
      await pool.query(schema);
      console.log('Database schema initialized');
    }

    return true;
  } catch (error) {
    console.error('Failed to initialize database:', (error as Error).message);
    return false;
  }
}

// Helper function for parameterized queries (prevents SQL injection)
export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  
  if (process.env.NODE_ENV !== 'production') {
    console.log('Executed query', { text: text.substring(0, 100), duration, rows: result.rowCount });
  }
  
  return result.rows;
}

// Helper function for single row queries
export async function queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] || null;
}

// Helper function for transactions
export async function transaction<T>(callback: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Health check
export async function checkDatabaseHealth(): Promise<{ status: string; latency?: number }> {
  if (!process.env.DATABASE_URL) {
    return { status: 'not configured' };
  }

  try {
    const start = Date.now();
    await pool.query('SELECT 1');
    return { status: 'connected', latency: Date.now() - start };
  } catch (error) {
    return { status: 'error' };
  }
}

// Graceful shutdown
export async function closePool(): Promise<void> {
  await pool.end();
  console.log('Database pool closed');
}