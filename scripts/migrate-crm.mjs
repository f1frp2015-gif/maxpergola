import { loadEnvFile } from 'node:process';
import { neon } from '@neondatabase/serverless';

try { loadEnvFile('.env.local'); } catch {}
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required. Run `vercel env pull .env.local --yes`.');
const sql = neon(process.env.DATABASE_URL);

await sql.query(`
  CREATE TABLE IF NOT EXISTS crm_leads (
    id uuid PRIMARY KEY, created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'qualified', 'quoted', 'won', 'lost', 'archived')),
    source text NOT NULL, contact_name text NOT NULL, company text NOT NULL DEFAULT '',
    email text NOT NULL, phone text NOT NULL DEFAULT '', zip_code text NOT NULL,
    project_type text NOT NULL DEFAULT '', package_code text NOT NULL DEFAULT '',
    sku text NOT NULL DEFAULT '', size_label text NOT NULL DEFAULT '', layout text NOT NULL DEFAULT '',
    finish text NOT NULL DEFAULT '', accessories jsonb NOT NULL DEFAULT '[]'::jsonb,
    budget text NOT NULL DEFAULT '', timeline text NOT NULL DEFAULT '', message text NOT NULL DEFAULT '',
    engineering_inputs jsonb NOT NULL DEFAULT '{}'::jsonb, utm jsonb NOT NULL DEFAULT '{}'::jsonb,
    page_url text NOT NULL DEFAULT '', consent boolean NOT NULL DEFAULT false, ip_hash text,
    lead_score smallint NOT NULL DEFAULT 0 CHECK (lead_score BETWEEN 0 AND 100),
    owner text NOT NULL DEFAULT '', notes text NOT NULL DEFAULT '', last_contacted_at timestamptz
  )
`);
await sql.query(`CREATE INDEX IF NOT EXISTS crm_leads_status_created_idx ON crm_leads (status, created_at DESC)`);
await sql.query(`CREATE INDEX IF NOT EXISTS crm_leads_email_idx ON crm_leads (lower(email))`);
await sql.query(`CREATE INDEX IF NOT EXISTS crm_leads_zip_idx ON crm_leads (zip_code)`);
console.log('CRM schema is ready.');
