const ACCOUNTS = [
  {account_name:"Acme Corp",industry:"HR Tech",arr:180000,health_score:45,renewal_date:"2026-07-16",seats_licensed:120,seats_active:52,nps:28,open_tickets:7,csm:"Sarah Chen",key_challenge:"Low product adoption — finance team never onboarded",notes:"Decision maker changed in April"},
  {account_name:"TechFlow Inc",industry:"FinTech",arr:320000,health_score:78,renewal_date:"2026-11-28",seats_licensed:200,seats_active:174,nps:52,open_tickets:2,csm:"Marcus Reid",key_challenge:"Expansion blocked by procurement freeze",notes:"Champion flagged possible reorg in Q4"},
  {account_name:"GrowthCo",industry:"E-commerce",arr:95000,health_score:62,renewal_date:"2026-07-01",seats_licensed:40,seats_active:28,nps:41,open_tickets:4,csm:"Sarah Chen",key_challenge:"Evaluating competitor — renewal in 30 days",notes:"Price sensitivity flagged on last call"},
  {account_name:"DataStream",industry:"Analytics",arr:450000,health_score:88,renewal_date:"2027-02-26",seats_licensed:300,seats_active:285,nps:67,open_tickets:1,csm:"Jin Park",key_challenge:"Wants custom API reporting not yet on roadmap",notes:"Strong exec sponsor — VP of Data"},
  {account_name:"NovaSaaS",industry:"MarTech",arr:210000,health_score:35,renewal_date:"2026-07-09",seats_licensed:80,seats_active:31,nps:18,open_tickets:12,csm:"Marcus Reid",key_challenge:"Executive sponsor left — usage dropped 60% last quarter",notes:"New VP not yet engaged — critical account"},
  {account_name:"PulseHR",industry:"HR Tech",arr:155000,health_score:71,renewal_date:"2026-09-21",seats_licensed:90,seats_active:79,nps:49,open_tickets:3,csm:"Jin Park",key_challenge:"Slow adoption of compliance module launched in March",notes:"Potential expansion to 150 seats if adoption improves"},
  {account_name:"ScaleUp",industry:"Sales Tech",arr:280000,health_score:55,renewal_date:"2026-08-12",seats_licensed:150,seats_active:88,nps:35,open_tickets:6,csm:"Sarah Chen",key_challenge:"Data quality issues reducing ROI visibility for leadership",notes:"Requested product roadmap call — integration gaps cited"}
];

function parseCSV(csv) {
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).filter(l => l.trim()).map(line => {
    const values = [];
    let cur = '', inQ = false;
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ; }
      else if (ch === ',' && !inQ) { values.push(cur.trim()); cur = ''; }
      else cur += ch;
    }
    values.push(cur.trim());
    return headers.reduce((o, h, i) => ({ ...o, [h]: values[i] ?? '' }), {});
  });
}

export default {
  async fetch(request, env) {
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    // GET → return accounts (from Google Sheets if SHEET_ID set, else embedded)
    if (request.method === 'GET') {
      let accounts = ACCOUNTS;
      if (env.SHEET_ID) {
        try {
          const res = await fetch(`https://docs.google.com/spreadsheets/d/${env.SHEET_ID}/export?format=csv&gid=0`);
          if (res.ok) {
            const parsed = parseCSV(await res.text());
            if (parsed.length > 0) accounts = parsed;
          }
        } catch {}
      }
      return new Response(JSON.stringify(accounts), {
        headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' }
      });
    }

    if (request.method !== 'POST') return new Response('Not found', { status: 404, headers: cors });

    let body;
    try { body = await request.json(); }
    catch { return new Response('Invalid JSON', { status: 400, headers: cors }); }

    const {
      account_name = 'Demo Company', industry = 'SaaS',
      arr = 120000, health_score = 72,
      renewal_date = '', seats_licensed = 100, seats_active = 70,
      nps = 45, open_tickets = 3, csm = 'CSM',
      challenge = 'Improving product adoption',
      transcript = '', notes = ''
    } = body;

    const usage = seats_licensed > 0 ? Math.round(seats_active / seats_licensed * 100) : 0;
    const days = renewal_date ? Math.round((new Date(renewal_date) - new Date()) / 86400000) : null;
    const renewalStr = renewal_date ? `${renewal_date} (${days} days away)` : 'Not set';

    const prompt = `You are a senior Customer Success analyst preparing a board-ready QBR.

ACCOUNT DATA:
Account: ${account_name} | Industry: ${industry}
ARR: $${Number(arr).toLocaleString()} | Health Score: ${health_score}/100
Renewal: ${renewalStr}
Seats: ${seats_active} active / ${seats_licensed} licensed → ${usage}% adoption
NPS: ${nps} | Open Tickets: ${open_tickets} | CSM: ${csm}
Challenge: ${challenge}${notes ? `\nNotes: ${notes}` : ''}${transcript ? `\n\nCALL TRANSCRIPT:\n${transcript.slice(0, 3000)}` : ''}

Generate a structured QBR. Be specific and direct. Use only the data provided — no invented numbers.

## Executive Summary
3 sentences max. Current state of the account, biggest risk, one clear recommendation.

## Health Dashboard
| Metric | Value | Status |
|--------|-------|--------|
Cover: ARR, Health Score, Seat Adoption, NPS, Open Tickets, Renewal Risk. Use 🟢🟡🔴 status icons.

## Key Risks
3 risks ranked by urgency. For each: **Risk name** — evidence from data, business impact, mitigation action, owner, deadline.

## 30-Day Action Plan
5 concrete actions. Format each as: **Action** | Owner | Due | Success Metric

## Expansion Opportunity
1 paragraph. Realistic upsell or expansion angle based on this account's actual data.

## This Week
One sentence only. The single most important action for ${csm} on Monday morning.`;

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': env.ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 2000,
          stream: true,
          messages: [{ role: 'user', content: prompt }]
        })
      });
      if (!res.ok) return new Response('API error: ' + await res.text(), { status: 500, headers: cors });
      return new Response(res.body, {
        headers: { ...cors, 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'X-Accel-Buffering': 'no' }
      });
    } catch (err) {
      return new Response('Worker error: ' + err.message, { status: 500, headers: cors });
    }
  }
};
