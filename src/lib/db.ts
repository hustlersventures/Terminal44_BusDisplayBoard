import "server-only";
import { Pool } from "pg";

/**
 * Direct Postgres connection — used only where Supabase's PostgREST API
 * genuinely can't do the job (listing/extending an enum type; there's no
 * table to `.from()` and this project deliberately has no DB-side
 * functions). Everything else in the app goes through the Supabase client
 * as usual. A singleton pool, guarded against Next.js dev-mode module
 * reloads creating a new one per hot reload.
 */
declare global {
  var _t44Pool: Pool | undefined;
}

export function getDbPool(): Pool {
  if (!globalThis._t44Pool) {
    globalThis._t44Pool = new Pool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      port: Number(process.env.DB_PORT),
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: { rejectUnauthorized: false },
      max: 5,
    });
  }
  return globalThis._t44Pool;
}
