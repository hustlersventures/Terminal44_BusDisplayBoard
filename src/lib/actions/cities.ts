"use server";

import { revalidatePath } from "next/cache";
import { getDbPool } from "@/lib/db";
import type { ActionResult } from "@/lib/actions/buses";

const VALID_CITY_NAME = /^[A-Za-z][A-Za-z .'-]{0,99}$/;

function normalizeCityName(raw: string) {
  return raw
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/** Doubles embedded single quotes — the standard-conforming-string-safe way to inline a literal into DDL that can't take a bind parameter. */
function escapeSqlLiteral(value: string) {
  return value.replace(/'/g, "''");
}

/**
 * The route From/To options come from a Postgres enum (public.bus_route_city),
 * not a table — deliberately, so there's no extra table for this. There's
 * no PostgREST/table access to an enum, and this project has no DB-side
 * functions, so this goes through a direct Postgres connection instead of
 * the usual Supabase client.
 */
export async function getCities(): Promise<string[]> {
  const pool = getDbPool();
  const { rows } = await pool.query<{ name: string }>(
    "select unnest(enum_range(null::public.bus_route_city))::text as name",
  );
  return rows.map((r) => r.name);
}

/**
 * Adds a city if it isn't already one of the enum's values. Postgres enums
 * are append-only — there is no equivalent "remove" operation.
 */
export async function addCity(name: string): Promise<ActionResult & { name?: string }> {
  const normalized = normalizeCityName(name);
  if (!normalized) return { ok: false, error: "City name is required." };
  if (!VALID_CITY_NAME.test(normalized)) {
    return { ok: false, error: "Use letters, spaces, apostrophes, or hyphens only." };
  }

  const pool = getDbPool();
  try {
    await pool.query(
      `alter type public.bus_route_city add value if not exists '${escapeSqlLiteral(normalized)}'`,
    );
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Could not add city." };
  }

  revalidatePath("/admin/cities");
  revalidatePath("/admin/buses/new");
  return { ok: true, name: normalized };
}
