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

const loadoutInstructions =
  "You generate playful but practical AI build loadouts for the murmur.red Playbooks section. Do not ask follow-up questions. Infer a useful direction even for strange ideas like 'time machine' or 'black hole'. Return exactly three paths: fast prototype, balanced workflow/app, and product-grade build. For each path, include a detailed build-ready blueprint that answers implementation tasks, exact files/modules/services/packages/accounts, data model, API contracts, AI prompt/schema, MVP increments, loop engineering, evals, logging, failure handling, blockers, and architecture decisions. Make the blueprint specific to the user's exact idea. Prefer concrete tools. Use 'AI model' and 'Team channel' as tool placeholders when the user's chosen provider/channel should be inserted by the frontend.";

const fastLoadoutInstructions =
  "You generate playful but practical AI build loadouts for the murmur.red Playbooks section. Do not ask follow-up questions. Infer a useful direction even for strange ideas like 'time machine' or 'black hole'. Return exactly three paths: fast prototype, balanced workflow/app, and product-grade build. Return only concise card data: category, interpretation, and three loadouts with id, title, level, score, tools, why, and moves. Do not include a blueprint; the frontend builds the full copy/paste blueprint locally. Prefer concrete tools. Use 'AI model' and 'Team channel' as placeholders when the user's chosen provider/channel should be inserted by the frontend.";

const stringList = (minItems, maxItems, description) => ({
  type: 'array', minItems, maxItems, description, items: { type: 'string' }
});

const blueprintSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'mvpDefinition','architecture','devScope','buildPhases','loopEngineering','testingPlan',
    'acceptanceCriteria','implementationTasks','filesServicesPackagesAccounts','dataModel',
    'apiContracts','aiPrompt','aiResponseSchema','blockers','decisions'
  ],
  properties: {
    mvpDefinition: { type: 'string', description: "Concrete MVP definition tailored to the user's exact build request." },
    architecture: stringList(3, 3, 'Architecture components and how they connect.'),
    devScope: stringList(3, 4, 'Full implementation scope across frontend, backend, data, AI, integrations, deployment.'),
    buildPhases: stringList(3, 3, 'Small coherent build phases from prototype to product-grade.'),
    loopEngineering: stringList(3, 4, 'Repeatable loop: input, AI, validation, tools, approval, execution, logging, feedback, evals.'),
    testingPlan: stringList(3, 3, 'Unit, integration, e2e, eval, and failure-mode tests.'),
    acceptanceCriteria: stringList(3, 3, 'Concrete conditions that prove the MVP works.'),
    implementationTasks: stringList(3, 4, 'Specific implementation tasks answered for the user.'),
    filesServicesPackagesAccounts: stringList(3, 4, 'Files/modules, services, packages, and accounts needed.'),
    dataModel: stringList(3, 3, 'Data records/tables/collections needed.'),
    apiContracts: stringList(2, 2, 'API endpoints or workflow contracts with inputs and outputs.'),
    aiPrompt: { type: 'string', description: 'The prompt for the AI step, tailored to this build.' },
    aiResponseSchema: { type: 'string', description: 'The response schema the AI step should return.' },
    blockers: stringList(3, 3, 'True blockers and assumptions to flag before building.'),
    decisions: stringList(3, 3, 'Architecture/product decisions already made for the user.')
  }
};

const loadoutResponseSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['category', 'interpretation', 'loadouts'],
  properties: {
    category: { type: 'string', description: "Short name for the user's build category." },
    interpretation: { type: 'string', description: 'One concise sentence explaining how the build request was interpreted.' },
    loadouts: {
      type: 'array', minItems: 3, maxItems: 3,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'title', 'level', 'score', 'tools', 'why', 'moves', 'blueprint'],
        properties: {
          id: { type: 'string', description: 'Slug-safe identifier.' },
          title: { type: 'string', description: 'Short loadout name.' },
          level: { type: 'string', description: 'Fastest, Balanced, Advanced, or another short difficulty label.' },
          score: { type: 'string', description: 'Short payoff label, such as Prototype, Workflow, or Product-grade.' },
          tools: { type: 'array', minItems: 4, maxItems: 6, items: { type: 'string' } },
          why: { type: 'string', description: 'One practical reason this loadout fits.' },
          moves: { type: 'array', minItems: 4, maxItems: 5, items: { type: 'string' } },
          blueprint: { ...blueprintSchema, description: 'Build-ready blueprint that answers implementation questions for this specific loadout.' }
        }
      }
    }
  }
};

const fastLoadoutResponseSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['category', 'interpretation', 'loadouts'],
  properties: {
    category: { type: 'string', description: "Short name for the user's build category." },
    interpretation: { type: 'string', description: 'One concise sentence explaining how the build request was interpreted.' },
    loadouts: {
      type: 'array', minItems: 3, maxItems: 3,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'title', 'level', 'score', 'tools', 'why', 'moves'],
        properties: {
          id: { type: 'string', description: 'Slug-safe identifier.' },
          title: { type: 'string', description: 'Short loadout name.' },
          level: { type: 'string', description: 'Fastest, Balanced, Advanced, or another short difficulty label.' },
          score: { type: 'string', description: 'Short payoff label, such as Prototype, Workflow, or Product-grade.' },
          tools: { type: 'array', minItems: 4, maxItems: 6, items: { type: 'string' } },
          why: { type: 'string', description: 'One practical reason this loadout fits.' },
          moves: { type: 'array', minItems: 4, maxItems: 5, items: { type: 'string' } }
        }
      }
    }
  }
};

function cleanLoadoutInput(value, maxLength = 240) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function redactPromptSample(value) {
  return cleanLoadoutInput(value)
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email]')
    .replace(/https?:\/\/\S+/gi, '[url]')
    .replace(/\+?\d[\d\s().-]{7,}\d/g, '[phone]')
    .replace(/\b\d{4,}\b/g, '[number]');
}

async function logAnonymousPromptSample({ quest, modelChoice, teamChannel, logUrl }) {
  const event = {
    event: 'playbook_prompt_sample',
    sample: redactPromptSample(quest),
    inputLength: quest.length,
    modelChoice,
    teamChannel,
    createdAt: new Date().toISOString()
  };

  console.info('playbook prompt sample', event);
  if (!logUrl) return;

  try {
    await fetch(logUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(event)
    });
  } catch (err) {
    console.warn('playbook prompt sample logging failed', err);
  }
}

function buildLoadoutInput(quest, modelChoice, teamChannel) {
  return [
    `User build request: ${quest}`,
    `Preferred AI model/provider inside the product: ${modelChoice}`,
    `Preferred team channel: ${teamChannel}`
  ].join('\n');
}

const PROVIDER_TIMEOUT_MS = 7_500;

async function fetchWithTimeout(url, options, timeoutMs = PROVIDER_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err) {
    if (err.name === 'AbortError') throw new Error(`Request timed out after ${timeoutMs}ms`);
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

async function callOpenAIForLoadouts({ apiKey, model, quest, modelChoice, teamChannel }) {
  const res = await fetchWithTimeout('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model: model || 'gpt-5-nano-2025-08-07',
      max_output_tokens: 1400,
      instructions: fastLoadoutInstructions,
      input: buildLoadoutInput(quest, modelChoice, teamChannel),
      text: {
        format: {
          type: 'json_schema',
          name: 'playbook_loadouts',
          strict: true,
          schema: fastLoadoutResponseSchema
        }
      }
    })
  });

  const raw = await res.text();
  if (!res.ok) throw new Error(`OpenAI returned ${res.status}: ${raw.slice(0, 1200)}`);

  const data = JSON.parse(raw);
  const text = typeof data.output_text === 'string'
    ? data.output_text
    : (data.output || []).flatMap(item => item.content || []).map(c => c.text || '').join('').trim();
  if (!text) throw new Error('OpenAI returned no output text.');
  return JSON.parse(text);
}

function stripArrayBounds(schema) {
  if (Array.isArray(schema)) return schema.map(stripArrayBounds);
  if (!schema || typeof schema !== 'object') return schema;
  const { minItems, maxItems, ...rest } = schema;
  const out = {};
  for (const [key, value] of Object.entries(rest)) out[key] = stripArrayBounds(value);
  return out;
}

const claudeLoadoutSchema = stripArrayBounds(fastLoadoutResponseSchema);

async function callClaudeForLoadouts({ apiKey, model, quest, modelChoice, teamChannel }) {
  const input = buildLoadoutInput(quest, modelChoice, teamChannel);

  const res = await fetchWithTimeout('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({
      model: model || 'claude-haiku-4-5-20251001',
      max_tokens: 1400,
      system: fastLoadoutInstructions,
      messages: [{ role: 'user', content: input }],
      tools: [{
        name: 'emit_playbook_loadouts',
        description: 'Return the generated Playbooks loadouts and detailed blueprints. This tool must be called exactly once.',
        input_schema: claudeLoadoutSchema
      }],
      tool_choice: { type: 'tool', name: 'emit_playbook_loadouts' }
    })
  });

  const raw = await res.text();
  if (!res.ok) throw new Error(`Claude returned ${res.status}: ${raw.slice(0, 1200)}`);

  const data = JSON.parse(raw);
  const toolUse = (data.content || []).find(b => b.type === 'tool_use' && b.name === 'emit_playbook_loadouts');
  if (!toolUse?.input) throw new Error('Claude did not return the expected playbook loadout tool call.');
  return toolUse.input;
}

function shortLoadoutQuestName(text) {
  return String(text || '')
    .replace(/^build\s+/i, '')
    .replace(/^an?\s+/i, '')
    .trim()
    .split(/\s+/)
    .slice(0, 5)
    .join(' ') || 'custom idea';
}

function detectLoadoutType(text) {
  const value = String(text || '').toLowerCase();
  if (/(black hole|space|planet|orbit|gravity|star|galaxy|cosmos|universe|astronomy|physics)/.test(value)) return 'space';
  if (/(time machine|timeline|history|historical|memory|archive|past|future|simulation|world|story|game|experience|museum)/.test(value)) return 'speculative';
  if (/(gmail|email|inbox|calendar|meeting|event)/.test(value)) return 'email';
  if (/(support|ticket|helpdesk|customer|reply|triage)/.test(value)) return 'support';
  if (/(spreadsheet|report|dashboard|analytics|data|metric)/.test(value)) return 'data';
  if (/(portal|client|request|file|status)/.test(value)) return 'portal';
  if (/(shop|ecommerce|order|refund|inventory|store)/.test(value)) return 'commerce';
  if (/(research|competitor|brief|monitor|news|lead)/.test(value)) return 'research';
  return 'custom';
}

function createLoadoutFallbackResponse(quest) {
  const type = detectLoadoutType(quest);
  const subject = shortLoadoutQuestName(quest);
  const modelTool = 'AI model';
  const channelTool = 'Team channel';

  const responses = {
    email: {
      category: 'Inbox Automation',
      interpretation: 'I read this as inbox/calendar automation, so the loadouts focus on triggers, approvals, and message/event actions.',
      loadouts: [
        {
          id: 'email-speed',
          title: 'Speed Run',
          level: 'Fastest',
          score: 'No-code',
          tools: ['n8n', 'Gmail', 'Google Calendar', modelTool, 'Google Sheets'],
          why: 'Best for proving the flow quickly: trigger from Gmail, classify the message, draft a reply, create an event, and log the action.',
          moves: ['Trigger on new labeled Gmail messages.', 'Classify intent with the selected AI model.', 'Create reply draft or calendar event.', 'Log every action in Sheets.']
        },
        {
          id: 'email-review',
          title: 'Review Queue',
          level: 'Safer',
          score: 'Human-in-loop',
          tools: ['Zapier', 'Gmail', 'Google Calendar', 'Airtable', modelTool],
          why: 'Best when the AI should suggest actions but a person approves replies and meetings before anything is sent.',
          moves: ['Push emails into Airtable.', 'Generate recommended reply and event details.', 'Approve or edit.', 'Sync approved actions back to Google.']
        },
        {
          id: 'email-control',
          title: 'Control Build',
          level: 'Advanced',
          score: 'Product-grade',
          tools: ['Google APIs', 'Cloudflare Workers', 'Supabase', modelTool, 'Resend'],
          why: 'Best when this becomes a real product with custom rules, durable logs, retries, and user accounts.',
          moves: ['Connect Google OAuth.', 'Store rules and email events.', 'Run classification in workers.', 'Track every action and exception.']
        }
      ]
    },
    speculative: {
      category: 'Speculative Build',
      interpretation: `I read "${subject}" as a creative/speculative experience. I will suggest prototype, simulation, and research-backed loadouts.`,
      loadouts: [
        {
          id: 'speculative-prototype',
          title: 'Interactive Prototype',
          level: 'Fastest',
          score: 'Playable',
          tools: ['Lovable or Bolt', 'Supabase', modelTool, 'TimelineJS', 'Vercel'],
          why: 'Best for making the idea tangible fast: users pick a time, see a generated scene, and explore a branching experience.',
          moves: ['Define the core fantasy in one sentence.', 'Create three eras or destinations.', 'Generate scenes with the selected AI model.', 'Publish a clickable prototype.']
        },
        {
          id: 'speculative-sim',
          title: 'Simulation Engine',
          level: 'Balanced',
          score: 'World model',
          tools: ['Next.js', 'Supabase', modelTool, 'Three.js', 'Vercel'],
          why: 'Best when the build needs a real interface, saved journeys, generated timelines, and immersive visuals.',
          moves: ['Model time periods, characters, and events.', 'Build the journey screen.', 'Generate consequences and alternate paths.', 'Add visual timeline or 3D scene.']
        },
        {
          id: 'speculative-research',
          title: 'Research-backed Explorer',
          level: 'Advanced',
          score: 'Grounded',
          tools: ['Gemini or Perplexity', 'Wikidata', 'Supabase', modelTool, 'Next.js'],
          why: 'Best when the experience should be historically grounded instead of pure fantasy.',
          moves: ['Pull source facts for each era.', 'Store citations and event data.', 'Generate scenes from sourced facts.', 'Show sources and uncertainty to users.']
        }
      ]
    },
    space: {
      category: 'Space/Science Build',
      interpretation: `I read "${subject}" as a science/space experience. I will suggest visualizer, simulation, and learning loadouts.`,
      loadouts: [
        {
          id: 'space-visual',
          title: 'Cosmic Visualizer',
          level: 'Fastest',
          score: 'Interactive',
          tools: ['Three.js', modelTool, 'NASA APIs', 'Vercel'],
          why: 'Best for making a space idea tangible: users can see, rotate, and explore the concept instead of reading a static explanation.',
          moves: ['Define the core space object or phenomenon.', 'Create a 3D scene.', 'Use the selected AI model to explain what users are seeing.', 'Add one interactive control.']
        },
        {
          id: 'space-simulator',
          title: 'Physics Sandbox',
          level: 'Balanced',
          score: 'Simulation',
          tools: ['Next.js', 'Three.js', 'Rapier or Cannon.js', modelTool, 'Vercel'],
          why: 'Best when the idea needs motion, gravity, forces, or cause-and-effect play.',
          moves: ['Choose the simplified physics rules.', 'Build a sandbox scene.', 'Add sliders for mass, speed, or distance.', 'Explain outcomes in plain language.']
        },
        {
          id: 'space-learning',
          title: 'Learning Quest',
          level: 'Advanced',
          score: 'Educational',
          tools: ['Next.js', 'Supabase', modelTool, 'Wikidata or NASA', 'Vercel'],
          why: 'Best when the experience should teach, save progress, and adapt explanations to the user.',
          moves: ['Create lesson checkpoints.', 'Pull trustworthy source facts.', 'Generate explanations and quizzes.', 'Track what the user has explored.']
        }
      ]
    }
  };

  if (responses[type]) return responses[type];

  return {
    category: 'Custom AI Build',
    interpretation: `I do not have an exact category for "${subject}" yet, so I will infer three build paths: quick prototype, workflow, and product-grade app.`,
    loadouts: [
      {
        id: 'custom-prototype',
        title: 'Prototype Quest',
        level: 'Fastest',
        score: 'Playable',
        tools: ['Lovable or Bolt', 'Airtable', modelTool, 'Vercel'],
        why: `Best for quickly making "${subject}" feel real enough to test with another person.`,
        moves: ['Define the one core interaction.', 'Create a clickable screen.', 'Connect simple storage.', 'Use the selected AI model for the magic moment.']
      },
      {
        id: 'custom-workflow',
        title: 'Workflow Quest',
        level: 'Balanced',
        score: 'Useful',
        tools: ['n8n', 'Airtable', modelTool, channelTool],
        why: `Best if "${subject}" is mostly a repeatable process, approval loop, or automation.`,
        moves: ['Define the trigger.', 'Create the data table.', 'Add AI classification or generation.', 'Send the result to the team channel.']
      },
      {
        id: 'custom-product',
        title: 'Product Quest',
        level: 'Advanced',
        score: 'Scalable',
        tools: ['Next.js', 'Supabase', modelTool, 'Vercel'],
        why: `Best if "${subject}" needs users, saved state, permissions, and a polished interface.`,
        moves: ['Model users and records.', 'Build the first product screen.', 'Add one AI action.', 'Deploy and test with real users.']
      }
    ]
  };
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

    // POST /loadouts → AI Build Loadouts for Playbooks
    if (url.pathname === '/loadouts') {
      const quest = cleanLoadoutInput(body.quest);
      const modelChoice = cleanLoadoutInput(body.modelChoice, 40) || 'openai';
      const teamChannel = cleanLoadoutInput(body.teamChannel, 40) || 'teams';

      if (!quest || quest.length < 2) {
        return new Response(JSON.stringify({ error: 'Missing build request.' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } });
      }

      const promptLogPromise = logAnonymousPromptSample({ quest, modelChoice, teamChannel, logUrl: env.PLAYBOOK_PROMPT_LOG_URL });

      const anthropicKey = env.ANTHROPIC_API_KEY || env.ANTHROPIC_KEY;
      const providers = [
        {
          name: 'OpenAI',
          configured: Boolean(env.OPENAI_API_KEY),
          run: () => callOpenAIForLoadouts({ apiKey: env.OPENAI_API_KEY, model: env.OPENAI_MODEL, quest, modelChoice, teamChannel })
        },
        {
          name: 'Claude',
          configured: Boolean(anthropicKey),
          run: () => callClaudeForLoadouts({ apiKey: anthropicKey, model: env.ANTHROPIC_MODEL, quest, modelChoice, teamChannel })
        }
      ].filter(p => p.configured);

      if (!providers.length) {
        await promptLogPromise;
        console.warn('playbook loadout generation using generated fallback: no AI provider configured');
        return new Response(JSON.stringify(createLoadoutFallbackResponse(quest)), { headers: { ...cors, 'Content-Type': 'application/json' } });
      }

      const attempts = await Promise.allSettled(providers.map(async provider => {
        try {
          return await provider.run();
        } catch (err) {
          console.error(`${provider.name} loadout generation failed`, err);
          throw err;
        }
      }));

      const success = attempts.find(attempt => attempt.status === 'fulfilled' && attempt.value);
      if (success) {
        await promptLogPromise;
        return new Response(JSON.stringify(success.value), { headers: { ...cors, 'Content-Type': 'application/json' } });
      }

      await promptLogPromise;
      console.warn('playbook loadout generation using generated fallback: providers unavailable');
      return new Response(JSON.stringify(createLoadoutFallbackResponse(quest)), { headers: { ...cors, 'Content-Type': 'application/json' } });
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
