import { supabase } from '@/integrations/supabase/client';
import JSZip from 'jszip';

const PAGE_SIZE = 1000;

/** Fetch every row of a table, paginating past Supabase row limits. */
export type ExportTable =
  | 'profiles'
  | 'rooms'
  | 'reservations'
  | 'payments'
  | 'messages'
  | 'saved_searches';

export async function fetchAllRows(
  table: ExportTable,
  columns: string,
): Promise<Record<string, unknown>[]> {
  const rows: Record<string, unknown>[] = [];
  let from = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .order('created_at', { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;
    const batch = (data as unknown as Record<string, unknown>[]) || [];
    rows.push(...batch);
    if (batch.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return rows;
}

/** Business columns only — no credentials, tokens or secrets. */
export const PROFILE_COLUMNS = [
  'id', 'user_id', 'public_id', 'full_name', 'email', 'phone', 'whatsapp', 'gender',
  'date_of_birth', 'age', 'nationality', 'occupation', 'occupation_status', 'job_title',
  'university', 'faculty', 'is_student_verified', 'about', 'bio', 'looking_for',
  'is_smoker', 'has_pets', 'pet_type', 'personality_tags', 'interested_area_1',
  'interested_area_2', 'hear_about_us', 'referral_code', 'referred_by', 'referral_count',
  'email_verified', 'phone_verified', 'verification_status', 'avatar_url', 'cover_url',
  'is_disabled', 'disabled_at', 'disabled_reason', 'created_at', 'updated_at',
].join(', ');

export const ROOM_COLUMNS = [
  'id', 'owner_id', 'title', 'description', 'room_type', 'price_per_month', 'deposit',
  'insurance_amount', 'price_negotiable', 'city', 'area', 'address', 'location_link',
  'photos', 'videos', 'amenities', 'rules', 'bills_included', 'personality_tags',
  'available_from', 'min_stay_months', 'max_roommates', 'current_roommates',
  'total_bedrooms', 'preferred_gender', 'allowed_gender', 'lister_type',
  'allows_smoking', 'allows_pets', 'allows_visits', 'has_natural_gas', 'has_wifi',
  'has_elevator', 'has_balcony', 'has_doorman', 'has_ac', 'has_water_heater',
  'has_private_bathroom', 'is_student_listing', 'instant_book', 'is_featured',
  'status', 'views_count', 'created_at', 'updated_at',
].join(', ');

/* ---------------- CSV ---------------- */

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  let str: string;
  if (Array.isArray(value) || (typeof value === 'object')) str = JSON.stringify(value);
  else str = String(value);
  if (/[",\n\r]/.test(str)) str = `"${str.replace(/"/g, '""')}"`;
  return str;
}

export function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const header = columns.map(csvCell).join(',');
  const body = rows.map(r => columns.map(c => csvCell(r[c])).join(',')).join('\n');
  // BOM keeps Excel happy with UTF-8 (Arabic content)
  return `\uFEFF${header}\n${body}\n`;
}

/* ---------------- SQL ---------------- */

function sqlLiteral(value: unknown): string {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'NULL';
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  if (Array.isArray(value)) {
    const items = value.map(v => `"${String(v).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`);
    return `'{${items.join(',')}}'`.replace(/'/g, "'");
  }
  if (typeof value === 'object') {
    return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
  }
  return `'${String(value).replace(/'/g, "''")}'`;
}

export function toSqlInserts(
  table: string,
  rows: Record<string, unknown>[],
  columns: string[],
  conflictKey = 'id',
): string {
  if (rows.length === 0) return `-- no rows for ${table}\n`;
  const colList = columns.map(c => `"${c}"`).join(', ');
  const lines = rows.map(
    r => `INSERT INTO public.${table} (${colList}) VALUES (${columns.map(c => sqlLiteral(r[c])).join(', ')}) ON CONFLICT (${conflictKey}) DO NOTHING;`,
  );
  return `-- ${rows.length} rows for public.${table}\n${lines.join('\n')}\n`;
}

/* ---------------- download helpers ---------------- */

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadText(content: string, filename: string, mime: string) {
  downloadBlob(new Blob([content], { type: `${mime};charset=utf-8` }), filename);
}

export async function downloadZip(files: Record<string, string>, filename: string) {
  const zip = new JSZip();
  Object.entries(files).forEach(([name, content]) => zip.file(name, content));
  const blob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(blob, filename);
}

export const timestamp = () => new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
