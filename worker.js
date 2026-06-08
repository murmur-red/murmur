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

async function fetchPerplexity(company, apiKey) {
  const res = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'sonar',
      messages: [{
        role: 'user',
        content: `Research "${company}" and return a JSON object with these fields:
- funding: latest funding round or investment news (string, or null)
- acquisitions: any recent acquisitions or mergers (string, or null)
- new_hires: notable senior hires or leadership changes in the past 6 months (string, or null)
- news: 2-3 most important recent company news items (string)
- strategy: current strategic priorities or product direction (string)
- headcount: approximate company size or recent headcount change (string, or null)
Return ONLY valid JSON. No markdown, no explanation.`
      }],
      max_tokens: 600,
    })
  });
  if (!res.ok) throw new Error('Perplexity error: ' + res.status);
  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content?.trim() || '{}';
  try {
    return JSON.parse(raw.replace(/^```(?:json)?\s*/,'').replace(/\s*```$/,''));
  } catch {
    return { news: raw.slice(0, 400) };
  }
}

async function fetchGrok(company, apiKey) {
  const res = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'grok-3',
      messages: [{
        role: 'user',
        content: `Search X/Twitter for recent posts about "${company}". Return a JSON object with:
- sentiment: overall sentiment on X right now (positive/neutral/negative + 1 sentence)
- trending_topics: what people are talking about regarding this company (string)
- complaints: any recurring complaints or concerns being discussed (string, or null)
- praise: what the market is praising about them (string, or null)
Return ONLY valid JSON. No markdown, no explanation.`
      }],
      max_tokens: 400,
    })
  });
  if (!res.ok) throw new Error('Grok error: ' + res.status);
  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content?.trim() || '{}';
  try {
    return JSON.parse(raw.replace(/^```(?:json)?\s*/,'').replace(/\s*```$/,''));
  } catch {
    return { sentiment: raw.slice(0, 300) };
  }
}

export default {
  async fetch(request, env) {
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    const url = new URL(request.url);

    // GET → return accounts
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

    // POST /research → parallel Perplexity + Grok lookup
    if (url.pathname === '/research') {
      const company = (body.company || '').trim();
      if (!company) return new Response(JSON.stringify({ error: 'No company name' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } });

      const [perplexity, grok] = await Promise.allSettled([
        env.PERPLEXITY_KEY ? fetchPerplexity(company, env.PERPLEXITY_KEY) : Promise.resolve(null),
        env.GROK_API_KEY   ? fetchGrok(company, env.GROK_API_KEY)         : Promise.resolve(null),
      ]);

      return new Response(JSON.stringify({
        company,
        perplexity: perplexity.status === 'fulfilled' ? perplexity.value : null,
        grok:       grok.status === 'fulfilled'       ? grok.value       : null,
      }), { headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    // POST / → generate QBR with optional research context
    const {
      account_name = 'Demo Company', industry = 'SaaS',
      arr = 120000, health_score = 72,
      renewal_date = '', seats_licensed = 100, seats_active = 70,
      nps = 45, open_tickets = 3, csm = 'CSM',
      challenge = 'Improving product adoption',
      transcript = '', notes = '',
      research = null,
    } = body;

    const usage = seats_licensed > 0 ? Math.round(seats_active / seats_licensed * 100) : 0;
    const days = renewal_date ? Math.round((new Date(renewal_date) - new Date()) / 86400000) : null;
    const renewalStr = renewal_date ? `${renewal_date} (${days} days away)` : 'Not set';

    let researchBlock = '';
    if (research) {
      const p = research.perplexity || {};
      const g = research.grok || {};
      researchBlock = `

LIVE COMPANY INTELLIGENCE (sourced from Perplexity + X/Twitter — treat as context, not verified fact):
Company researched: ${research.company || account_name}
${p.funding        ? `• Funding/Investment: ${p.funding}` : ''}
${p.acquisitions   ? `• Acquisitions/M&A: ${p.acquisitions}` : ''}
${p.new_hires      ? `• Leadership/Hiring: ${p.new_hires}` : ''}
${p.headcount      ? `• Team Size: ${p.headcount}` : ''}
${p.news           ? `• Recent News: ${p.news}` : ''}
${p.strategy       ? `• Strategic Direction: ${p.strategy}` : ''}
${g.sentiment      ? `• X/Twitter Sentiment: ${g.sentiment}` : ''}
${g.trending_topics ? `• What People Are Saying: ${g.trending_topics}` : ''}
${g.complaints     ? `• Market Complaints: ${g.complaints}` : ''}
${g.praise         ? `• Market Praise: ${g.praise}` : ''}`.replace(/\n\n+/g, '\n').trim();
    }

    const prompt = `You are a senior Customer Success analyst at murmur.red — an AI Customer Lifecycle consultancy run by Lena Ry, based in Amsterdam. You are preparing a board-ready QBR for one of murmur.red's clients.

murmur.red context: We specialise in AI-powered customer lifecycle automation — helping SaaS companies reduce churn, drive adoption, and build scalable CS operations. We bring AI tools, playbooks, and hands-on execution. Our value proposition is turning customer success from a cost centre into a growth engine.

ACCOUNT DATA:
Account: ${account_name} | Industry: ${industry}
ARR: $${Number(arr).toLocaleString()} | Health Score: ${health_score}/100
Renewal: ${renewalStr}
Seats: ${seats_active} active / ${seats_licensed} licensed → ${usage}% adoption
NPS: ${nps} | Open Tickets: ${open_tickets} | CSM: ${csm}
Challenge: ${challenge}${notes ? `\nNotes: ${notes}` : ''}${transcript ? `\n\nCALL TRANSCRIPT:\n${transcript.slice(0, 3000)}` : ''}
${researchBlock ? `\n${researchBlock}` : ''}

Generate a comprehensive, structured QBR. Be specific and direct. Where account data is provided, use it exactly. Where research intel is available, reference it to add strategic depth.

## Executive Summary
3 sentences max. Current state of the account, biggest risk, one clear recommendation. Frame from murmur.red's perspective as their CS partner.

## Health Dashboard
| Metric | Value | Status |
|--------|-------|--------|
Cover: ARR, Health Score, Seat Adoption, NPS, Open Tickets, Renewal Risk. Use 🟢🟡🔴 status icons.

## Market Intelligence
What is happening at ${account_name} right now. Use the research intel — funding, hires, strategy, market signals. Connect each signal to implications for their relationship with murmur.red. If no research available, note that data was not provided.

## Key Risks
3 risks ranked by urgency. For each: **Risk name** — evidence from data and/or market intel, business impact, mitigation action, owner, deadline.

## murmur.red Impact This Quarter
What murmur.red specifically delivered for this account. Frame our AI automation work, playbooks, or lifecycle initiatives. Be concrete about the value we provided.

## 30-Day Action Plan
5 concrete actions. Format each as: **Action** | Owner | Due | Success Metric

## Expansion Opportunity
1 paragraph. Realistic upsell or expansion angle based on this account's data and market signals. Connect to murmur.red's AI lifecycle capabilities.

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
          max_tokens: 2500,
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
