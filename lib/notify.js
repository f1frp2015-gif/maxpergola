import { cleanText } from './crm.js';

const resendEndpoint = 'https://api.resend.com/emails';
const defaultTo = 'inquiry@maxpergola.com';
const defaultFrom = 'Max Pergola Website <website@maxpergola.com>';
// Reply-To only accepts a bare address; anything that could be read as a list or display name is dropped.
const replyableAddress = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]+$/;

function recipients() {
  return (process.env.INQUIRY_EMAIL_TO || defaultTo).split(',').map((item) => item.trim()).filter(Boolean);
}

export function formatLeadEmail(lead, { reference, crmUrl, saved }) {
  const fields = [
    ['Reference', reference], ['Source', lead.source], ['Name', lead.contactName],
    ['Company', lead.company], ['Email', lead.email], ['Phone', lead.phone],
    ['Delivery location', lead.zipCode], ['Project type', lead.projectType],
    ['Package', lead.packageCode], ['SKU', lead.sku], ['Size', lead.sizeLabel],
    ['Layout', lead.layout], ['Finish', lead.finish], ['Accessories', lead.accessories.join(', ')],
    ['Budget', lead.budget], ['Timeline', lead.timeline], ['Lead score', String(lead.leadScore)],
    ['Page', lead.pageUrl]
  ].filter(([, value]) => value);
  const sections = [fields.map(([label, value]) => `${label}: ${value}`).join('\n')];
  if (lead.message) sections.push(`Message:\n${lead.message}`);
  if (Object.keys(lead.engineeringInputs).length) sections.push(`Engineering inputs:\n${JSON.stringify(lead.engineeringInputs, null, 2)}`);
  if (Object.keys(lead.utm).length) sections.push(`Attribution:\n${JSON.stringify(lead.utm, null, 2)}`);
  sections.push(saved
    ? `Open in CRM: ${crmUrl}`
    : 'WARNING: this inquiry could not be saved to the CRM database. This email is the only copy.');
  const summary = [lead.contactName, lead.packageCode || lead.projectType, lead.zipCode].filter(Boolean).join(' · ');
  return {subject: cleanText(`New inquiry ${reference} — ${summary}`, 200), text: sections.join('\n\n')};
}

// Never throws: the caller decides whether a failed notification should fail the request.
export async function sendLeadNotification(lead, options) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return {sent: false, error: 'RESEND_API_KEY is not configured'};
  const { subject, text } = formatLeadEmail(lead, options);
  try {
    const response = await fetch(resendEndpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json',
        'Idempotency-Key': `lead-${lead.id}`
      },
      body: JSON.stringify({
        // Send from our own verified domain and put the visitor in Reply-To; using the visitor's
        // address as From fails SPF/DMARC and gets the message dropped when inquiry@ forwards it.
        from: process.env.INQUIRY_EMAIL_FROM || defaultFrom, to: recipients(), subject, text,
        ...(replyableAddress.test(lead.email) ? {reply_to: lead.email} : {})
      }),
      signal: AbortSignal.timeout(8000)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) return {sent: false, error: result.message || `Resend responded with ${response.status}`};
    return {sent: true, id: result.id};
  } catch (error) {
    return {sent: false, error: error instanceof Error ? error.message : 'Unable to send the notification email.'};
  }
}
