export default {
  async fetch(request, env) {
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: cors });

    let body;
    try { body = await request.json(); } catch { return new Response('Invalid JSON', { status: 400, headers: cors }); }

    const { account_name, arr, health_score, challenge } = body;

    const prompt = `You are a senior Customer Success analyst. Generate a concise, executive-quality QBR.

Account: ${account_name || 'Demo Company'}
ARR: $${Number(arr || 120000).toLocaleString()}
Health Score: ${health_score || 72}/100
Key Challenge: ${challenge || 'Improving product adoption'}

Use only the data provided. No invented numbers.

## Executive Summary
3 sentences. Direct assessment — what is the state of this account right now.

## Health Dashboard
| Metric | Value | Status |
|--------|-------|--------|
Health Score, ARR, and 3-4 derived metrics based on the challenge. Use 🟢🟡🔴.

## Top 3 Risks
**Risk name** — evidence from the data, business impact, mitigation action, owner, due date (use 2026 dates).

## Action Items for Next 30 Days
5 concrete actions. Each: what, who, by when, success criterion.

## This Week's Priority
One sentence. The single most important thing the CSM must do Monday morning.`;

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': env.ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1200,
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
