export const aiData = {
  'GPT4': {
    title: 'GPT4',
    identity: 'OpenAI’s flagship model focused on reasoning, logic, and language precision.',
    strengths: [
      'Advanced reasoning and logic',
      'Multilingual support',
      'Excellent code generation'
    ],
    limitations: [
      'Occasional hallucinations',
      'Lacks real-time internet access unless augmented',
      'Heavier compute cost in API'
    ],
    useCases: [
      'Startup idea generation',
      'Chatbot backend for apps',
      'Educational tool for students'
    ],
    prompts: [
      'Summarize this article in 3 sentences and suggest a tweet.',
      'Translate this legal document into layman terms.',
      'Write a Python script to batch-rename files.'
    ],
    api: 'Available via OpenAI API (chat/completions endpoint)',
    safety: 'Moderated via OpenAI’s safety layers (with adjustable settings)',
    updated: '2025‑05‑29'
  },

  'Claude3': {
    title: 'Claude3',
    identity: 'Anthropic’s model focused on interpretability, alignment, and safe reasoning.',
    strengths: [
      'Document Q&A with long contexts (100K tokens)',
      'Clear reasoning chain',
      'Emphasis on safe, aligned output'
    ],
    limitations: [
      'Less expressive than GPT4',
      'Limited tooling and exposure',
      'Focused mostly on text use cases'
    ],
    useCases: [
      'Enterprise knowledge retrieval',
      'Transparent audit logs',
      'Legal and regulatory Q&A'
    ],
    prompts: [
      'List the main arguments in this PDF.',
      'How would you rewrite this for compliance?',
      'Which section of this report needs fact-checking?'
    ],
    api: 'Anthropic API (Claude and Claude Instant)',
    safety: 'Trained on Constitutional AI principles with human feedback loop',
    updated: '2025‑05‑29'
  },

  'Gemini': {
    title: 'Gemini',
    identity: 'Google DeepMind’s multimodal AI built for web, documents, and vision integration.',
    strengths: [
      'Multimodal (text + image + doc)',
      'Tight integration with Google tools',
      'Strong vision understanding'
    ],
    limitations: [
      'Currently requires tuning for custom enterprise use',
      'Less accessible than GPT4 API',
      'Some features still in rollout phase'
    ],
    useCases: [
      'Research summarization with graphs',
      'Slides and doc generation',
      'Live support bots for support teams'
    ],
    prompts: [
      'What does this image show?',
      'Generate a chart-based summary from this spreadsheet.',
      'Describe key elements in this UI screenshot.'
    ],
    api: 'Vertex AI via Google Cloud, Workspace Add‑ons',
    safety: 'Aligned to Google’s internal AI safety protocols',
    updated: '2025‑05‑29'
  }
};