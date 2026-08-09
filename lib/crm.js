import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import { neon } from '@neondatabase/serverless';

const allowedStatuses = new Set(['new', 'qualified', 'quoted', 'won', 'lost', 'archived']);
let client;

export function getSql() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured');
  if (!client) client = neon(process.env.DATABASE_URL);
  return client;
}

export function json(data, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set('Content-Type', 'application/json; charset=utf-8');
  headers.set('Cache-Control', 'no-store');
  headers.set('X-Content-Type-Options', 'nosniff');
  return new Response(JSON.stringify(data), {...init, headers});
}

export function cleanText(value, maxLength = 500) {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

export function cleanMultiline(value, maxLength = 4000) {
  if (typeof value !== 'string') return '';
  return value.replace(/\u0000/g, '').trim().slice(0, maxLength);
}

export function cleanArray(value, maxItems = 12) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, maxItems).map((item) => cleanText(item, 80)).filter(Boolean);
}

export function normalizeLead(payload, request) {
  const contactName = cleanText(payload.contactName || payload.name, 120);
  const email = cleanText(payload.email, 254).toLowerCase();
  const phone = cleanText(payload.phone, 40);
  const zipCode = cleanText(payload.zipCode || payload.zip, 10).toUpperCase();
  const packageCode = cleanText(payload.packageCode || payload.package, 20).toUpperCase();
  const timeline = cleanText(payload.timeline, 80);
  const budget = cleanText(payload.budget, 80);
  const consent = payload.consent === true || payload.consent === 'true' || payload.consent === 'on';

  if (!contactName) throw new Error('Please enter your name.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Please enter a valid email address.');
  if (!/^\d{5}(?:-\d{4})?$/.test(zipCode)) throw new Error('Please enter a valid U.S. ZIP code.');
  if (!consent) throw new Error('Please agree to be contacted about this project.');

  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '';
  const ipHash = forwardedFor
    ? createHash('sha256').update(`${forwardedFor}:${process.env.CRM_ADMIN_TOKEN || 'maxpergola'}`).digest('hex')
    : null;
  const score = Math.min(100,
    25 + (phone ? 10 : 0) + (packageCode ? 10 : 0) + (timeline ? 10 : 0) +
    (budget ? 10 : 0) + (cleanText(payload.sku, 120) ? 10 : 0) +
    (cleanMultiline(payload.message, 4000).length > 40 ? 10 : 0)
  );

  return {
    id: randomUUID(), source: cleanText(payload.source, 80) || 'website', contactName,
    company: cleanText(payload.company, 160), email, phone, zipCode,
    projectType: cleanText(payload.projectType, 80), packageCode,
    sku: cleanText(payload.sku, 160), sizeLabel: cleanText(payload.sizeLabel || payload.size, 120),
    layout: cleanText(payload.layout, 80), finish: cleanText(payload.finish, 120),
    accessories: cleanArray(payload.accessories), budget, timeline,
    message: cleanMultiline(payload.message, 4000),
    engineeringInputs: payload.engineeringInputs && typeof payload.engineeringInputs === 'object' ? payload.engineeringInputs : {},
    utm: payload.utm && typeof payload.utm === 'object' ? payload.utm : {},
    pageUrl: cleanText(payload.pageUrl, 500), consent, ipHash, leadScore: score
  };
}

export function isAuthorized(request) {
  const expected = process.env.CRM_ADMIN_TOKEN || '';
  const supplied = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || '';
  if (!expected || !supplied) return false;
  const expectedBuffer = Buffer.from(expected);
  const suppliedBuffer = Buffer.from(supplied);
  return expectedBuffer.length === suppliedBuffer.length && timingSafeEqual(expectedBuffer, suppliedBuffer);
}

export function normalizeUpdate(payload) {
  const status = cleanText(payload.status, 20).toLowerCase();
  if (status && !allowedStatuses.has(status)) throw new Error('Invalid lead status.');
  return {
    id: cleanText(payload.id, 64), status: status || null,
    owner: payload.owner === undefined ? null : cleanText(payload.owner, 100),
    notes: payload.notes === undefined ? null : cleanMultiline(payload.notes, 6000),
    markContacted: payload.markContacted === true
  };
}
