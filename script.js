// Navigation functions
function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    const hamburger = document.querySelector('.hamburger');
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
}

function closeMenu() {
    const navLinks = document.getElementById('navLinks');
    const hamburger = document.querySelector('.hamburger');
    navLinks.classList.remove('active');
    hamburger.classList.remove('active');
}

// Workflow toggle
function toggleWorkflow(element) {
    element.classList.toggle('collapsed');
    element.classList.toggle('active');
}

// Modal functions
function openModal(type) {
    document.getElementById(type + 'Modal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(type) {
    document.getElementById(type + 'Modal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

// CS Flow Details Data
const flowDetailsData = {
    trigger1: {
        title: "No Login for 7 Days",
        type: "trigger",
        description: "Customer hasn't logged into the platform for 7 consecutive days - early warning sign of disengagement",
        aiActions: [
            "Sends 'We miss you' email with personalized value reminders based on past usage",
            "Updates health score: Yellow flag in CRM automatically",
            "Analyzes last activity to personalize outreach message",
            "If 14 days no login → Escalates to Red flag + CSM intervention triggered"
        ],
        humanNotifications: [
            "CSM Alert: 'Dormant account - needs personal outreach within 48 hours'",
            "CS Manager notified if pattern detected across multiple accounts"
        ],
        tools: ["HubSpot/Salesforce CRM", "Customer.io", "Gainsight", "ChurnZero"],
        crossTeam: "Marketing can retarget with educational content via paid ads. Product team analyzes if recent changes caused drop-off."
    },
    trigger2: {
        title: "Low Feature Usage Detected",
        type: "trigger",
        description: "Customer using only 1-2 basic features, missing out on 80% of platform value - major expansion opportunity",
        aiActions: [
            "Sends feature discovery email: 'You're missing out on [specific features]'",
            "Attaches personalized demo video of advanced features relevant to their use case",
            "Books optional product demo with calendar link",
            "Logs 'Expansion Opportunity' in CRM with specific feature recommendations",
            "Tracks if customer clicks on features to gauge interest"
        ],
        humanNotifications: [
            "CSM: 'Upsell potential - low feature adoption. Consider power user conversion call'",
            "Sales: Gets notified of expansion opportunity with $ value estimate",
            "Product: Receives data on which features aren't being adopted"
        ],
        tools: ["Mixpanel", "Amplitude", "Gainsight", "Pendo", "Productboard"],
        crossTeam: "Product team investigates why features aren't being discovered. Marketing creates targeted feature adoption campaigns. CS designs better onboarding."
    },
    trigger3: {
        title: "Support Ticket Created",
        type: "trigger",
        description: "Customer submits a support request through any channel (email, chat, phone, in-app)",
        aiActions: [
            "AI checks knowledge base for instant answer using NLP matching",
            "Auto-responds if simple/FAQ (handles 60% of tickets automatically)",
            "Routes complex issues to appropriate support tier (L1, L2, specialist)",
            "Logs in Zendesk + creates Jira ticket if technical bug detected",
            "Sets SLA timer based on customer priority and issue severity",
            "Suggests related KB articles to support agent"
        ],
        humanNotifications: [
            "Support agent gets categorized ticket with AI-suggested solutions",
            "CSM notified if high-priority customer or 2nd+ ticket this week",
            "Engineering alerted immediately if P0/P1 bug with stack trace"
        ],
        tools: ["Zendesk", "Intercom", "Jira", "Linear", "Help Scout", "Freshdesk"],
        crossTeam: "Product team receives aggregated bug reports weekly. Engineering gets critical bugs in real-time. CS tracks satisfaction scores post-resolution."
    },
    trigger4: {
        title: "Low NPS Score (0-6)",
        type: "trigger",
        description: "Customer gives detractor score in NPS survey - critical churn risk requiring immediate intervention",
        aiActions: [
            "Triggers immediate retention outreach email within 1 hour",
            "Books urgent retention call (CSM contacted within 48 hours)",
            "Updates CRM: Red flag 'Detractor' with churn probability score",
            "Opens automated 'Win-Back' campaign workflow",
            "Prepares retention offer (discount/extension) for CSM to deploy",
            "Analyzes feedback text for root cause using sentiment analysis"
        ],
        humanNotifications: [
            "CSM: CRITICAL - Detractor needs immediate personal attention",
            "CS Manager: Churn risk - leadership review required for accounts >$50K",
            "Product Team: Negative feedback - investigate root cause themes",
            "Executive team: Auto-alert for enterprise clients ($100K+ ARR)"
        ],
        tools: ["Delighted", "SurveyMonkey", "Gainsight", "ChurnZero", "Wootric"],
        crossTeam: "Executive team loops in for key accounts. Finance prepares flexible retention pricing. Product analyzes feedback themes for roadmap priorities. Legal notified if threatening language."
    },
    aiengine: {
        title: "AI Decision Engine",
        type: "action",
        description: "Central intelligence hub that processes all customer data, predicts outcomes, and orchestrates actions across the entire stack",
        aiActions: [
            "Analyzes customer data from 10+ sources in real-time (CRM, product analytics, support, billing)",
            "Calculates health scores using ML models trained on historical churn data",
            "Predicts churn risk with 85%+ accuracy using behavioral patterns",
            "Determines optimal intervention timing based on customer lifecycle stage",
            "Routes actions to appropriate teams with context and recommendations",
            "Learns from outcomes to improve decision accuracy over time",
            "Identifies expansion opportunities by analyzing usage patterns vs. plan limits"
        ],
        humanNotifications: [
            "Generates daily CS team briefing: At-risk accounts, expansion opportunities, key metrics",
            "Flags high-risk accounts for immediate manager review",
            "Surfaces hidden expansion opportunities that humans might miss",
            "Sends weekly executive summary: health score trends, churn predictions, revenue impact"
        ],
        tools: ["Claude API", "OpenAI GPT-4", "Custom ML Models", "Zapier", "Make", "n8n", "Python Scripts"],
        crossTeam: "Integrates with ALL departments for unified 360° customer view. Sales gets expansion alerts. Product gets usage insights. Finance gets revenue predictions. Marketing gets segmentation data."
    },
    action1: {
        title: "Automated Re-engagement Email",
        type: "action",
        description: "Hyper-personalized email campaign to bring inactive users back, tailored to their specific usage history",
        aiActions: [
            "Analyzes user's complete behavior history to personalize content",
            "Highlights features they previously used most (e.g., 'Your reports are waiting')",
            "Includes relevant case studies from similar companies in their industry",
            "Adapts tone based on previous interactions (formal vs. casual)",
            "Schedules 2-3 follow-up emails if first is ignored, with escalating urgency",
            "A/B tests subject lines and content to optimize open rates"
        ],
        humanNotifications: [
            "CSM sees email campaign status in real-time dashboard",
            "Alert if email bounces (bad email) or spam complaint received",
            "Notification if customer engages (opens/clicks) for immediate follow-up"
        ],
        tools: ["Customer.io", "Braze", "Iterable", "SendGrid", "Mailchimp", "ActiveCampaign"],
        crossTeam: "Marketing provides A/B tested content templates and design. CS provides customer insights. Product highlights new features to showcase."
    },
    action2: {
        title: "Auto-Book CSM Meeting",
        type: "action",
        description: "Automatically schedules intervention call with customer success manager using calendar intelligence",
        aiActions: [
            "Scans both customer and CSM calendars to find mutual 30-min availability",
            "Sends calendar invite with clear agenda and Zoom link",
            "Prepares comprehensive customer briefing document for CSM with: health score, recent activity, support tickets, usage trends, talking points",
            "Sets up Zoom/Teams meeting link automatically",
            "Sends reminder 24 hours before call + 1 hour before",
            "If customer declines, suggests 3 alternative times"
        ],
        humanNotifications: [
            "CSM receives meeting prep document 24 hours in advance with AI-generated talking points",
            "Manager notified of all intervention calls scheduled for weekly planning",
            "Alert if customer reschedules 2+ times (possible churn signal)"
        ],
        tools: ["Calendly", "Chili Piper", "Google Calendar", "Outlook", "Zoom", "Gainsight"],
        crossTeam: "Sales can optionally join high-value account calls. Product can join if feature-related issue. Finance standby for pricing discussions."
    },
    action3: {
        title: "Smart Ticket Routing",
        type: "action",
        description: "AI-powered ticket categorization and intelligent routing to the right team member based on expertise",
        aiActions: [
            "Analyzes ticket content using NLP to understand intent and technical details",
            "Categorizes by type (bug, feature request, how-to, billing, integration)",
            "Determines urgency level (P0-P3) based on language and customer priority",
            "Routes to specific agent based on: expertise, current workload, past performance",
            "Suggests 3-5 relevant KB articles to agent with confidence scores",
            "Predicts resolution time based on similar historical tickets",
            "Auto-translates if customer writes in non-English language"
        ],
        humanNotifications: [
            "Support agent receives pre-categorized ticket with AI insights and suggested solutions",
            "Team lead alerted if SLA at risk (approaching deadline)",
            "CSM notified automatically for VIP customers or repeat issues"
        ],
        tools: ["Zendesk AI", "Intercom", "Help Scout", "Freshdesk", "Front", "Kustomer"],
        crossTeam: "Engineering for bugs (creates Jira automatically). Product for feature requests (logs in Productboard). Finance for billing issues. DevOps for infrastructure problems."
    },
    action4: {
        title: "Urgent Escalation Protocol",
        type: "action",
        description: "Immediate escalation for critical situations requiring senior intervention - all hands on deck",
        aiActions: [
            "Detects negative sentiment in communications using advanced sentiment analysis",
            "Identifies legal/compliance trigger words (lawsuit, lawyer, regulatory)",
            "Flags enterprise account risks (>$100K ARR) automatically",
            "Prepares executive briefing in <5 minutes with full context",
            "Notifies all stakeholders simultaneously via Slack, email, SMS",
            "Creates dedicated Slack war room channel with all relevant parties",
            "Pulls all historical context: tickets, calls, contracts, correspondence"
        ],
        humanNotifications: [
            "CS Manager: URGENT - Immediate review required within 1 hour",
            "Account Executive: Customer at CRITICAL risk - join war room",
            "VP CS: Executive intervention needed - schedule call ASAP",
            "Legal: If threatening language detected - review for compliance",
            "Finance: Prepare retention pricing options",
            "Product: If product-related crisis - investigate immediately"
        ],
        tools: ["PagerDuty", "Slack", "Gainsight", "ChurnZero", "Twilio (SMS)"],
        crossTeam: "ALL HANDS ON DECK - Sales, CS, Product, Executive team, Legal if needed. Everyone gets context instantly. Coordinated response within hours."
    },
    csm: {
        title: "Customer Success Manager (CSM)",
        type: "notification",
        description: "Primary human touchpoint for customer relationships - the quarterback of customer success",
        responsibilities: [
            "Reviews AI-generated health scores and alerts every morning",
            "Conducts intervention calls for at-risk accounts (AI-scheduled)",
            "Facilitates Quarterly Business Reviews (QBRs) showing ROI",
            "Identifies and qualifies expansion opportunities for Sales",
            "Coordinates with Sales on upsells and renewals",
            "Provides product feedback to Product team from customer conversations",
            "Manages executive relationships for enterprise accounts",
            "Tracks adoption milestones and celebrates customer wins"
        ],
        aiSupport: [
            "Receives daily briefing: Top 10 accounts needing attention with specific action items",
            "Gets AI-generated talking points before every customer call",
            "AI summarizes all recent customer interactions across channels",
            "Automated meeting notes transcribed and action items extracted",
            "Renewal forecasts with probability scores",
            "Expansion opportunity identification with $ value estimates"
        ],
        tools: ["Gainsight", "ChurnZero", "Totango", "Planhat", "Slack", "Zoom", "Gmail"],
        metrics: ["Customer Health Score (0-100)", "Net Promoter Score (NPS)", "Product Adoption Rate (%)", "Gross Renewal Rate (%)", "Net Revenue Retention (%)"]
    },
    support: {
        title: "Support Team",
        type: "notification",
        description: "Frontline technical problem solvers - the guardians of customer satisfaction",
        responsibilities: [
            "Resolve customer tickets within SLA (L1: 4hrs, L2: 24hrs, L3: 48hrs)",
            "Escalate bugs to Engineering with full reproduction steps",
            "Maintain and update knowledge base articles based on common issues",
            "Identify product improvement opportunities from recurring questions",
            "Track customer satisfaction (CSAT) after every interaction",
            "Provide tier-2 technical support for complex issues",
            "Train customers on best practices during support interactions"
        ],
        aiSupport: [
            "AI suggests solutions from knowledge base with 90% accuracy",
            "Automatic ticket categorization and priority assignment",
            "Sentiment analysis on customer responses (happy/frustrated/angry)",
            "Predictive SLA breach warnings (30min before deadline)",
            "Auto-drafted responses that agents can edit and send",
            "Similar ticket suggestions to learn from past resolutions"
        ],
        tools: ["Zendesk", "Intercom", "Jira", "Confluence", "Loom (screen recordings)", "GitHub"],
        metrics: ["First Response Time (avg <2hrs)", "Resolution Time (avg <24hrs)", "CSAT Score (target >4.5/5)", "Ticket Volume (trend)", "% Auto-Resolved (60%+ goal)"]
    },
    product: {
        title: "Product Team",
        type: "notification",
        description: "Builders of customer value - the architects of the product roadmap",
        responsibilities: [
            "Prioritize feature requests from customers based on impact and frequency",
            "Investigate and fix reported bugs within SLA",
            "Analyze feature adoption metrics to improve UX",
            "Conduct user research and usability testing",
            "Communicate roadmap to customers through CS team",
            "Review NPS feedback weekly for product improvement themes",
            "Collaborate with Engineering on technical feasibility"
        ],
        aiSupport: [
            "AI aggregates and ranks feature requests by customer ARR, frequency, and strategic fit",
            "Usage pattern insights (which features drive retention?)",
            "Churn correlation analysis (what product issues cause churn?)",
            "Automated bug severity classification based on impact",
            "Sentiment analysis on feature feedback",
            "Competitive intel from customer conversations"
        ],
        tools: ["Jira", "Linear", "Productboard", "Canny", "Mixpanel", "Amplitude", "Figma"],
        metrics: ["Feature Adoption Rate (% users)", "Bug Resolution Time (P0: <24hrs)", "User Engagement Score", "Feature Request Implementation Rate"]
    },
    crm: {
        title: "CRM System (HubSpot/Salesforce)",
        type: "tool",
        description: "Single source of truth for all customer information - the brain of the operation",
        capabilities: [
            "Stores comprehensive customer profiles: contacts, company data, firmographics",
            "Tracks ALL interactions across channels: emails, calls, meetings, chats",
            "Manages sales pipeline and opportunities with deal stages",
            "Calculates health scores using AI on 15+ data points",
            "Generates reports and dashboards for executives",
            "Integrates bi-directionally with ALL other tools",
            "Workflows automate repetitive tasks (e.g., create renewal opp 90 days out)",
            "Custom fields for industry-specific data"
        ],
        aiEnhancements: [
            "Predictive lead scoring (0-100) based on fit and engagement",
            "Automated data enrichment from Clearbit, ZoomInfo",
            "Smart field suggestions to reduce manual data entry",
            "Duplicate detection and intelligent merging",
            "Next best action recommendations for each account",
            "Revenue forecasting with ML models",
            "Churn risk prediction with 85%+ accuracy"
        ],
        integrations: ["Gmail/Outlook", "Slack", "Zendesk", "Calendly", "Zoom", "LinkedIn", "Stripe", "Mixpanel"],
        dataFlow: "Hub-and-spoke model: CRM is the hub, all tools sync data bidirectionally. Customer updates propagate everywhere instantly."
    },
    zendesk: {
        title: "Support Platform (Zendesk)",
        type: "tool",
        description: "Command center for customer support - where problems get solved",
        capabilities: [
            "Multi-channel support: email, live chat, phone, social media, SMS",
            "Ticket management with customizable workflows and automation",
            "SLA tracking and breach warnings",
            "Self-service knowledge base (Help Center) with search",
            "Automated CSAT surveys after ticket resolution",
            "Advanced reporting and analytics dashboards",
            "Agent productivity tools (macros, saved replies)",
            "Customer portal for ticket status tracking"
        ],
        aiEnhancements: [
            "AI chatbot (Answer Bot) resolves 60% of tickets instantly using KB",
            "Smart ticket routing to best agent based on skills and workload",
            "Sentiment analysis on every message (frustrated customers prioritized)",
            "Suggested responses for agents (draft complete responses)",
            "Auto-tagging and categorization of tickets",
            "Predictive SLA breach alerts",
            "Auto-translation for 40+ languages"
        ],
        integrations: ["Salesforce/HubSpot", "Slack", "Jira", "Google Workspace", "Shopify", "Stripe"],
        dataFlow: "Ticket data flows to CRM for account context. Bugs auto-create Jira tickets. Insights flow to Product team. CSAT scores tracked in Gainsight."
    },
    jira: {
        title: "Project Management (Jira/Linear)",
        type: "tool",
        description: "Engineering command center - where bugs get fixed and features get built",
        capabilities: [
            "Agile project management: Scrum boards, Kanban workflows",
            "Bug tracking with priority levels (P0-P3) and severity",
            "Sprint planning and capacity management",
            "Release tracking and deployment coordination",
            "Custom workflows for different issue types",
            "Time tracking for resource planning",
            "Roadmap visualization for stakeholders",
            "Dependencies and blockers management"
        ],
        aiEnhancements: [
            "Auto-create tickets from support emails or customer feedback",
            "Smart priority suggestions based on customer impact + ARR",
            "Duplicate bug detection to prevent redundant work",
            "Story point estimation using ML on historical data",
            "Sprint planning assistance (optimal ticket selection)",
            "Auto-linking related issues and dependencies",
            "Predictive bug likelihood based on code changes"
        ],
        integrations: ["GitHub/GitLab", "Zendesk", "Slack", "Confluence", "Figma", "Sentry"],
        dataFlow: "Bugs from Support → Jira → Engineering fixes → QA validates → Deployment → CSM notifies customer. Full loop closed."
    },
    slack: {
        title: "Communication Hub (Slack/Teams)",
        type: "tool",
        description: "Real-time nervous system of the organization - where coordination happens",
        capabilities: [
            "Team channels organized by function, project, customer",
            "Direct messaging and group DMs",
            "File sharing and collaborative editing",
            "Video/audio calls and screen sharing",
            "App integrations bring data into conversations",
            "Searchable message history (never lose context)",
            "Custom bots and workflow automations",
            "Status updates and availability indicators"
        ],
        aiEnhancements: [
            "AI summarizes channel conversations (TL;DR on demand)",
            "Smart notification routing (only alert relevant people)",
            "Automated status updates from integrated tools",
            "Meeting scheduling bots (find time for 5 people instantly)",
            "Custom AI assistants for common questions",
            "Sentiment analysis on team morale",
            "Auto-archive inactive channels"
        ],
        integrations: ["EVERYTHING - Salesforce, Zendesk, Jira, Google Calendar, Zoom, GitHub, PagerDuty, etc."],
        dataFlow: "Central nervous system: ALL tools send alerts here. Decisions made in Slack propagate back to tools. Real-time coordination hub for entire organization."
    }
};

// Show flow details function
function showFlowDetails(nodeId) {
    const detailsDiv = document.getElementById('flowDetails');
    const data = flowDetailsData[nodeId];
    
    if (!data) {
        detailsDiv.innerHTML = '<p style="text-align: center; color: rgba(255, 255, 255, 0.6);">Select a node to see details</p>';
        detailsDiv.classList.remove('active');
        return;
    }

    // Remove active class from all nodes
    document.querySelectorAll('.flow-node').forEach(node => {
        node.classList.remove('active');
    });
    
    // Add active class to clicked node
    event.target.closest('.flow-node').classList.add('active');

    let html = `
        <h4>${data.title}</h4>
        <p><strong>Type:</strong> ${data.type.charAt(0).toUpperCase() + data.type.slice(1)}</p>
        <p>${data.description}</p>
    `;

    if (data.aiActions) {
        html += `
            <p style="margin-top: 15px;"><strong>🤖 AI Actions:</strong></p>
            <ul>
                ${data.aiActions.map(action => `<li>${action}</li>`).join('')}
            </ul>
        `;
    }

    if (data.humanNotifications) {
        html += `
            <p style="margin-top: 15px;"><strong>👤 Human Notifications:</strong></p>
            <ul>
                ${data.humanNotifications.map(notif => `<li>${notif}</li>`).join('')}
            </ul>
        `;
    }

    if (data.responsibilities) {
        html += `
            <p style="margin-top: 15px;"><strong>📋 Responsibilities:</strong></p>
            <ul>
                ${data.responsibilities.map(resp => `<li>${resp}</li>`).join('')}
            </ul>
        `;
    }

    if (data.capabilities) {
        html += `
            <p style="margin-top: 15px;"><strong>⚙️ Capabilities:</strong></p>
            <ul>
                ${data.capabilities.map(cap => `<li>${cap}</li>`).join('')}
            </ul>
        `;
    }

    if (data.aiSupport) {
        html += `
            <p style="margin-top: 15px;"><strong>🤖 AI Support:</strong></p>
            <ul>
                ${data.aiSupport.map(support => `<li>${support}</li>`).join('')}
            </ul>
        `;
    }

    if (data.aiEnhancements) {
        html += `
            <p style="margin-top: 15px;"><strong>✨ AI Enhancements:</strong></p>
            <ul>
                ${data.aiEnhancements.map(enh => `<li>${enh}</li>`).join('')}
            </ul>
        `;
    }

    if (data.tools) {
        html += `
            <p style="margin-top: 15px;"><strong>🛠️ Tools Used:</strong></p>
            <p style="color: var(--accent);">${Array.isArray(data.tools) ? data.tools.join(', ') : data.tools}</p>
        `;
    }

    if (data.integrations) {
        html += `
            <p style="margin-top: 15px;"><strong>🔗 Integrations:</strong></p>
            <p style="color: rgba(255, 255, 255, 0.7);">${Array.isArray(data.integrations) ? data.integrations.join(', ') : data.integrations}</p>
        `;
    }

    if (data.metrics) {
        html += `
            <p style="margin-top: 15px;"><strong>📊 Key Metrics:</strong></p>
            <p style="color: rgba(255, 255, 255, 0.7);">${Array.isArray(data.metrics) ? data.metrics.join(', ') : data.metrics}</p>
        `;
    }

    if (data.crossTeam) {
        html += `
            <p style="margin-top: 15px;"><strong>🔄 Cross-Team Coordination:</strong></p>
            <p style="color: rgba(255, 255, 255, 0.7);">${data.crossTeam}</p>
        `;
    }

    if (data.dataFlow) {
        html += `
            <p style="margin-top: 15px;"><strong>📊 Data Flow:</strong></p>
            <p style="color: rgba(255, 255, 255, 0.7);">${data.dataFlow}</p>
        `;
    }

    detailsDiv.innerHTML = html;
    detailsDiv.classList.add('active');

    // Scroll to details smoothly
    detailsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Job Fit Analyzer
function analyzeJob() {
    const jobDesc = document.getElementById('jobDescription').value;
    const result = document.getElementById('jobResult');
    
    if (!jobDesc.trim()) {
        alert('Please paste a job description first!');
        return;
    }
    
    result.innerHTML = '<h4>Analyzing...</h4>';
    result.classList.add('active');
    
    setTimeout(() => {
        const keywords = {
            operations: /operations|ops|operational|process/gi,
            ai: /ai|artificial intelligence|machine learning|ml|automation/gi,
            leadership: /lead|manage|director|head|vp/gi,
            technical: /sql|python|data|analytics|technical/gi,
            startup: /startup|scale|growth|fast-paced/gi,
            cs: /customer success|cs|customer/gi
        };
        
        let scores = {};
        let matches = [];
        
        for (let [key, regex] of Object.entries(keywords)) {
            const found = jobDesc.match(regex);
            scores[key] = found ? found.length : 0;
            if (found) matches.push(key);
        }
        
        const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
        const fitPercentage = Math.min(Math.round((totalScore / 15) * 100), 95);
        
        let recommendation = '';
        let emphasis = '';
        let redFlags = '';
        
        if (fitPercentage >= 70) {
            recommendation = '🟢 <strong>STRONG FIT!</strong> This role aligns well with your experience.';
        } else if (fitPercentage >= 50) {
            recommendation = '🟡 <strong>POSSIBLE FIT.</strong> You could make a case, but it\'ll require strong positioning.';
        } else {
            recommendation = '🔴 <strong>STRETCH ROLE.</strong> Consider if this is worth the effort.';
        }
        
        if (scores.ai > 0) {
            emphasis += '✓ Emphasize your AI-first approach and experience at Replai<br>';
        }
        if (scores.operations > 2) {
            emphasis += '✓ Highlight process optimization and scalability wins<br>';
        }
        if (scores.startup > 0) {
            emphasis += '✓ Lead with your co-founder experience and 0→1 building<br>';
        }
        if (scores.cs > 0) {
            emphasis += '✓ Frame CS experience as operations excellence<br>';
        }
        if (scores.technical > 0) {
            redFlags += '⚠️ Technical requirements present - be ready to discuss SQL/Python<br>';
        }
        
        result.innerHTML = `
            <h4>Match Score: ${fitPercentage}%</h4>
            <p><strong>Quick Take:</strong><br>${recommendation}</p>
            ${emphasis ? `<p><strong>What to Emphasize:</strong><br>${emphasis}</p>` : ''}
            ${redFlags ? `<p><strong>Red Flags:</strong><br>${redFlags}</p>` : ''}
            <p><strong>Keywords Found:</strong> ${matches.join(', ') || 'None detected'}</p>
            <p style="margin-top: 20px; font-size: 14px; opacity: 0.7;">💡 Pro tip: Use these insights to tailor your CV and cover letter to mirror their language.</p>
        `;
    }, 1500);
}

// CS Health Predictor
function analyzeCSHealth() {
    const customerName = document.getElementById('customerName').value;
    const loginFrequency = parseInt(document.getElementById('loginFrequency').value) || 0;
    const featureUsage = parseInt(document.getElementById('featureUsage').value) || 0;
    const supportTickets = parseInt(document.getElementById('supportTickets').value) || 0;
    const npsScore = parseInt(document.getElementById('npsScore').value) || 0;
    const contractValue = parseInt(document.getElementById('contractValue').value) || 0;
    const result = document.getElementById('csHealthResult');
    
    if (!customerName || loginFrequency === 0) {
        alert('Please fill in at least customer name and login frequency!');
        return;
    }
    
    result.innerHTML = '<h4>Analyzing customer health...</h4>';
    result.classList.add('active');
    
    setTimeout(() => {
        let healthScore = 0;
        let riskFactors = [];
        let opportunities = [];
        let actions = [];
        
        if (loginFrequency >= 20) {
            healthScore += 30;
        } else if (loginFrequency >= 10) {
            healthScore += 20;
        } else if (loginFrequency >= 5) {
            healthScore += 10;
            riskFactors.push('Low login frequency');
        } else {
            healthScore += 5;
            riskFactors.push('Very low engagement');
        }
        
        if (featureUsage >= 8) {
            healthScore += 25;
            opportunities.push('High feature adoption - potential for case study');
        } else if (featureUsage >= 5) {
            healthScore += 15;
        } else if (featureUsage >= 3) {
            healthScore += 10;
            actions.push('Schedule feature discovery call');
        } else {
            healthScore += 5;
            riskFactors.push('Minimal feature adoption');
            actions.push('Urgent: Implement onboarding program');
        }
        
        if (supportTickets === 0) {
            healthScore += 20;
        } else if (supportTickets <= 2) {
            healthScore += 15;
        } else if (supportTickets <= 5) {
            healthScore += 10;
            actions.push('Review recent support tickets for patterns');
        } else {
            healthScore += 5;
            riskFactors.push('High support volume');
            actions.push('Critical: Schedule health check call');
        }
        
        if (npsScore >= 9) {
            healthScore += 15;
            opportunities.push('Promoter - request testimonial/referral');
        } else if (npsScore >= 7) {
            healthScore += 10;
        } else if (npsScore >= 5) {
            healthScore += 5;
            actions.push('Follow up on satisfaction concerns');
        } else {
            healthScore += 2;
            riskFactors.push('Detractor - immediate attention needed');
            actions.push('Executive escalation recommended');
        }
        
        if (contractValue >= 100000) {
            healthScore += 10;
            opportunities.push('High-value account - prioritize for expansion');
        } else if (contractValue >= 50000) {
            healthScore += 8;
        } else if (contractValue >= 25000) {
            healthScore += 5;
        } else {
            healthScore += 3;
            opportunities.push('Upsell potential as usage grows');
        }
        
        let healthStatus = '';
        let healthColor = '';
        let churnRisk = '';
        
        if (healthScore >= 85) {
            healthStatus = 'EXCELLENT';
            healthColor = '#00ff00';
            churnRisk = 'Very Low (<5%)';
        } else if (healthScore >= 70) {
            healthStatus = 'HEALTHY';
            healthColor = '#00f2ff';
            churnRisk = 'Low (5-15%)';
        } else if (healthScore >= 50) {
            healthStatus = 'AT RISK';
            healthColor = '#ffed00';
            churnRisk = 'Medium (15-30%)';
        } else if (healthScore >= 30) {
            healthStatus = 'CRITICAL';
            healthColor = '#ff6600';
            churnRisk = 'High (30-50%)';
        } else {
            healthStatus = 'SEVERE';
            healthColor = '#ff0000';
            churnRisk = 'Very High (>50%)';
        }
        
        result.innerHTML = `
            <h4 style="color: ${healthColor};">${customerName} - Health Score: ${healthScore}/100</h4>
            <p><strong>Status:</strong> <span style="color: ${healthColor}; font-weight: 700;">${healthStatus}</span></p>
            <p><strong>Churn Risk:</strong> ${churnRisk}</p>
            
            ${riskFactors.length > 0 ? `
                <p style="margin-top: 20px;"><strong>⚠️ Risk Factors:</strong></p>
                <ul style="margin-left: 20px;">
                    ${riskFactors.map(risk => `<li>${risk}</li>`).join('')}
                </ul>
            ` : ''}
            
            ${opportunities.length > 0 ? `
                <p style="margin-top: 20px;"><strong>🚀 Opportunities:</strong></p>
                <ul style="margin-left: 20px;">
                    ${opportunities.map(opp => `<li>${opp}</li>`).join('')}
                </ul>
            ` : ''}
            
            ${actions.length > 0 ? `
                <p style="margin-top: 20px;"><strong>✅ Recommended Actions:</strong></p>
                <ul style="margin-left: 20px;">
                    ${actions.map(action => `<li>${action}</li>`).join('')}
                </ul>
            ` : '<p style="margin-top: 20px;"><strong>✅ Status:</strong> Continue regular check-ins</p>'}
            
            <p style="margin-top: 20px; font-size: 14px; opacity: 0.7;">
                💡 This AI-powered health score combines engagement, adoption, satisfaction, and value metrics to predict retention and identify growth opportunities.
            </p>
        `;
    }, 1800);
}

// Ops Efficiency Calculator
function calculateEfficiency() {
    const teamSize = parseInt(document.getElementById('teamSize').value);
    const manualHours = parseInt(document.getElementById('manualHours').value);
    const avgSalary = parseInt(document.getElementById('avgSalary').value);
    const result = document.getElementById('efficiencyResult');
    
    if (!teamSize || !manualHours || !avgSalary) {
        alert('Please fill in all fields!');
        return;
    }
    
    result.innerHTML = '<h4>Calculating...</h4>';
    result.classList.add('active');
    
    setTimeout(() => {
        const hourlyRate = avgSalary / 2080;
        const weeklyWaste = manualHours * teamSize * hourlyRate;
        const annualWaste = weeklyWaste * 52;
        
        const automationRate = 0.65;
        const annualSavings = annualWaste * automationRate;
        const timeSaved = manualHours * teamSize * automationRate;
        
        const implementationCost = 50000;
        const roi = ((annualSavings - implementationCost) / implementationCost * 100).toFixed(0);
        
        result.innerHTML = `
            <h4>💰 Annual Cost of Manual Operations</h4>
            <p style="font-size: 32px; color: var(--accent); font-weight: 700; margin: 10px 0;">$${annualWaste.toLocaleString()}</p>
            
            <h4 style="margin-top: 25px;">✨ With AI-First Automation</h4>
            <p><strong>Annual Savings:</strong> $${annualSavings.toLocaleString()}</p>
            <p><strong>Time Reclaimed:</strong> ${timeSaved.toFixed(1)} hours/week</p>
            <p><strong>First Year ROI:</strong> ${roi}%</p>
            <p><strong>Payback Period:</strong> ${(implementationCost / (annualSavings / 12)).toFixed(1)} months</p>
            
            <p style="margin-top: 20px; font-size: 14px; opacity: 0.7;">
                💡 These numbers assume 65% automation rate - conservative estimate based on my real-world implementations.
            </p>
        `;
    }, 1500);
}

// Chatbot
function askChatbot() {
    const question = document.getElementById('chatQuestion').value;
    const result = document.getElementById('chatResult');
    
    if (!question.trim()) {
        alert('Please ask a question first!');
        return;
    }
    
    result.innerHTML = '<h4>Thinking...</h4>';
    result.classList.add('active');
    
    setTimeout(() => {
        const q = question.toLowerCase();
        let answer = '';
        
        if (q.includes('experience') || q.includes('background')) {
            answer = '10+ years in operations across SaaS, Web3, AdTech, and AI. I\'ve been everything from an IC at a 300-person company to co-founder building from scratch. My superpower is taking messy, complex operations and turning them into elegant, AI-powered systems that scale.';
        } else if (q.includes('ai') || q.includes('automation')) {
            answer = 'I\'m obsessed with AI-first operations. Not just "let\'s add a chatbot" - I mean fundamentally rethinking processes from the ground up. At Merit Circle, I built automated workflows that handled 10x volume without adding headcount. At Replai, I used AI to predict churn and automate interventions. The future of ops is intelligent, adaptive systems.';
        } else if (q.includes('cs') || q.includes('customer success')) {
            answer = 'Customer Success is where operations meets revenue. I\'ve built CS teams that don\'t just prevent churn - they drive expansion. The CS Health Predictor tool above? That\'s the kind of AI-powered system I build. It combines engagement data, product usage, and sentiment to predict outcomes and trigger proactive interventions. Modern CS should be predictive, not reactive.';
        } else if (q.includes('sql') || q.includes('python') || q.includes('technical')) {
            answer = 'I have foundational SQL and Python skills - enough to query databases, analyze data, and build simple automation scripts. I\'m not an engineer, but I speak their language and can bridge between technical and business teams. Plus, I\'m always learning and expanding my technical toolkit.';
        } else if (q.includes('startup') || q.includes('scale')) {
            answer = 'I thrive in 0→1 and 1→10 stages. As a co-founder at Ygames, I built operations from scratch: team building, hiring decisions, and core workflows. I learned crucial lessons about lean operations. At Merit Circle, I scaled support from hundreds to 50,000+ users. I know how to build for today while planning for tomorrow.';
        } else if (q.includes('web3') || q.includes('blockchain') || q.includes('gaming')) {
            answer = 'Web3 + Gaming is my sweet spot. Co-founded Ygames where I handled all operational aspects from team building to game design workflows. Also managed operations at Merit Circle (Web3 Gaming DAO). I understand DAOs, smart contracts, tokenomics, and the unique operational challenges of decentralized systems. It\'s a wild west and I learned a ton from the experience.';
        } else if (q.includes('hire') || q.includes('work') || q.includes('available')) {
            answer = 'Open to full-time roles, fractional leadership, or advisory positions. Best fit: AI companies, high-growth startups (Series A-C), or companies rebuilding operations from scratch. I want hard problems, smart people, and the chance to build something that matters. Email me: murmur.red1@gmail.com';
        } else if (q.includes('approach') || q.includes('methodology') || q.includes('how')) {
            answer = 'My approach: 1) Understand the chaos deeply, 2) Break complex problems into smaller pieces, 3) Identify what can be automated vs. needs human touch, 4) Build with AI-first thinking, 5) Iterate ruthlessly based on data. I don\'t believe in "best practices" - I believe in what actually works for your specific context.';
        } else {
            answer = 'Great question! While this demo chatbot has limited responses, the real me would love to discuss this. Shoot me an email at murmur.red1@gmail.com or connect on LinkedIn. I\'m always up for interesting conversations about ops, AI, or building things that scale.';
        }
        
        result.innerHTML = `
            <h4>💬 Response</h4>
            <p>${answer}</p>
            <p style="margin-top: 20px; font-size: 14px; opacity: 0.7;">
                <em>Note: This is a demo chatbot. For real conversation, reach out directly!</em>
            </p>
        `;
    }, 1500);
}

// Contact Form
function submitContactForm(event) {
    event.preventDefault();
    
    const form = event.target;
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const result = document.getElementById('contactResult');
    const submitBtn = document.getElementById('submitContactBtn');
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    
    fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            result.innerHTML = `
                <h4 style="color: #00ff00;">✅ Message Sent Successfully!</h4>
                <p>Thanks for reaching out, ${name}! I'll get back to you at ${email} as soon as possible.</p>
                <p style="margin-top: 15px; font-size: 14px; opacity: 0.7;">
                    <em>💡 Tip: You can also connect with me on <a href="https://www.linkedin.com/in/lena-ry-8baa8716/" target="_blank" style="color: var(--primary);">LinkedIn</a> for a faster response!</em>
                </p>
            `;
            result.classList.add('active');
            form.reset();
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Message';
        } else {
            response.json().then(data => {
                if (Object.hasOwn(data, 'errors')) {
                    result.innerHTML = `
                        <h4 style="color: #ff6600;">⚠️ Oops!</h4>
                        <p>${data.errors.map(error => error.message).join(', ')}</p>
                    `;
                } else {
                    result.innerHTML = `
                        <h4 style="color: #ff6600;">⚠️ Something went wrong</h4>
                        <p>Please try again or email me directly at murmur.red1@gmail.com</p>
                    `;
                }
                result.classList.add('active');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send Message';
            });
        }
    })
    .catch(error => {
        result.innerHTML = `
            <h4 style="color: #ff6600;">⚠️ Connection Error</h4>
            <p>Please check your internet connection and try again, or email me directly at murmur.red1@gmail.com</p>
        `;
        result.classList.add('active');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
    });
}

// Event Listeners
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});
