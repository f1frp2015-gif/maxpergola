import { cleanText, getSql, isAuthorized, json, normalizeUpdate } from '../../lib/crm.js';

function unauthorized() {
  return json({ok: false, error: 'Unauthorized.'}, {status: 401, headers: {'WWW-Authenticate': 'Bearer'}});
}

export async function GET(request) {
  if (!isAuthorized(request)) return unauthorized();
  try {
    const url = new URL(request.url);
    const status = cleanText(url.searchParams.get('status') || '', 20).toLowerCase() || null;
    const search = cleanText(url.searchParams.get('search') || '', 120) || null;
    const sql = getSql();
    const rows = await sql.query(`
      SELECT id, created_at, updated_at, status, source, contact_name, company, email,
        phone, zip_code, project_type, package_code, sku, size_label, layout, finish,
        accessories, budget, timeline, message, engineering_inputs, page_url,
        lead_score, owner, notes, last_contacted_at
      FROM crm_leads
      WHERE ($1::text IS NULL OR status = $1)
        AND ($2::text IS NULL OR contact_name ILIKE '%' || $2 || '%'
          OR email ILIKE '%' || $2 || '%' OR zip_code ILIKE '%' || $2 || '%'
          OR sku ILIKE '%' || $2 || '%')
      ORDER BY created_at DESC LIMIT 250
    `, [status, search]);
    return json({ok: true, leads: rows});
  } catch (error) {
    console.error(JSON.stringify({event: 'crm_list_error', message: error instanceof Error ? error.message : 'Unknown error'}));
    return json({ok: false, error: 'Unable to load leads.'}, {status: 500});
  }
}

export async function PATCH(request) {
  if (!isAuthorized(request)) return unauthorized();
  try {
    const update = normalizeUpdate(await request.json());
    if (!/^[0-9a-f-]{36}$/i.test(update.id)) return json({ok: false, error: 'Invalid lead ID.'}, {status: 400});
    const sql = getSql();
    const rows = await sql.query(`
      UPDATE crm_leads SET status = COALESCE($2, status),
        owner = CASE WHEN $3::boolean THEN $4 ELSE owner END,
        notes = CASE WHEN $5::boolean THEN $6 ELSE notes END,
        last_contacted_at = CASE WHEN $7 THEN now() ELSE last_contacted_at END,
        updated_at = now()
      WHERE id = $1::uuid
      RETURNING id, status, owner, notes, last_contacted_at, updated_at
    `, [update.id, update.status, update.owner !== null, update.owner,
      update.notes !== null, update.notes, update.markContacted]);
    if (!rows.length) return json({ok: false, error: 'Lead not found.'}, {status: 404});
    console.info(JSON.stringify({event: 'crm_lead_updated', leadId: update.id, status: update.status}));
    return json({ok: true, lead: rows[0]});
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update lead.';
    return json({ok: false, error: message}, {status: /Invalid/.test(message) ? 400 : 500});
  }
}
