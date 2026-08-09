import { getSql, json, normalizeLead } from '../lib/crm.js';

export async function POST(request) {
  const startedAt = Date.now();
  try {
    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > 32768) {
      return json({ok: false, error: 'This inquiry is too large.'}, {status: 413});
    }
    const origin = request.headers.get('origin');
    if (origin && new URL(origin).host !== new URL(request.url).host) {
      return json({ok: false, error: 'Cross-site submissions are not accepted.'}, {status: 403});
    }
    if (!request.headers.get('content-type')?.includes('application/json')) {
      return json({ok: false, error: 'Send the inquiry as JSON.'}, {status: 415});
    }
    const payload = await request.json();
    if (payload.website) {
      console.info(JSON.stringify({event: 'crm_spam_rejected', durationMs: Date.now() - startedAt}));
      return json({ok: true, reference: 'received'});
    }
    const lead = normalizeLead(payload, request);
    const sql = getSql();
    if (lead.ipHash) {
      const recent = await sql.query(`
        SELECT count(*)::int AS count FROM crm_leads
        WHERE ip_hash = $1 AND created_at > now() - interval '10 minutes'
      `, [lead.ipHash]);
      if ((recent[0]?.count || 0) >= 5) {
        return json({ok: false, error: 'Too many recent requests. Please wait a few minutes or email inquiry@maxpergola.com.'}, {status: 429});
      }
    }
    await sql.query(`
      INSERT INTO crm_leads (
        id, source, contact_name, company, email, phone, zip_code, project_type,
        package_code, sku, size_label, layout, finish, accessories, budget, timeline,
        message, engineering_inputs, utm, page_url, consent, ip_hash, lead_score
      ) VALUES (
        $1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
        $14::jsonb, $15, $16, $17, $18::jsonb, $19::jsonb, $20, $21, $22, $23
      )
    `, [lead.id, lead.source, lead.contactName, lead.company, lead.email, lead.phone,
      lead.zipCode, lead.projectType, lead.packageCode, lead.sku, lead.sizeLabel,
      lead.layout, lead.finish, JSON.stringify(lead.accessories), lead.budget,
      lead.timeline, lead.message, JSON.stringify(lead.engineeringInputs),
      JSON.stringify(lead.utm), lead.pageUrl, lead.consent, lead.ipHash, lead.leadScore]);

    const reference = `MP-${lead.id.slice(0, 8).toUpperCase()}`;
    console.info(JSON.stringify({event: 'crm_lead_created', leadId: lead.id, source: lead.source, score: lead.leadScore, durationMs: Date.now() - startedAt}));
    return json({ok: true, reference}, {status: 201});
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to submit this inquiry.';
    const validationError = /Please|valid|agree/.test(message);
    console.error(JSON.stringify({event: 'crm_lead_error', message, durationMs: Date.now() - startedAt}));
    return json({ok: false, error: validationError ? message : 'We could not save your request. Please email inquiry@maxpergola.com.'}, {status: validationError ? 400 : 500});
  }
}
