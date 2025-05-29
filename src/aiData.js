// aiData.js — Centralized AI data for all platform components

const aiData = {
  'GPT‑4': {
    title: 'GPT‑4',
    summary: 'Advanced reasoning and creativity. Best for coding, writing, and summarizing.',
    deep: `
🔍 Overview:
GPT‑4 is OpenAI’s most powerful language model. It excels at complex reasoning, understanding context, and generating high-quality text.

🧠 Strengths:
• Code generation and debugging
• Creative writing and storytelling
• Multilingual support

💡 Best Use Cases:
• AI chat assistants
• Legal, medical, and scientific summaries
• Programming tools

🧪 Sample Prompts:
• "Summarize this legal contract in 5 bullet points."
• "Write a poem that uses only emojis."

🔧 Integration Options:
• OpenAI API
• Microsoft Copilot

🔄 Known Limitations:
• Prone to hallucination
• Limited real-time knowledge unless integrated with browsing tools
    `
  },
  'Claude 3': {
    title: 'Claude 3',
    summary: 'Trained with high interpretability in mind. Strong at document Q&A.',
    deep: `
🔍 Overview:
Claude 3 is a model from Anthropic, designed for alignment and clarity. It focuses on human-centered design and safety.

🧠 Strengths:
• Long-form document question answering
• Deep reasoning with low hallucination
• Ethical guardrails

💡 Best Use Cases:
• Enterprise knowledge base assistants
• Research-heavy Q&A
• Transparent audit trails

🧪 Sample Prompts:
• "What were the top 3 findings in this 30-page research paper?"
• "Explain this regulation in layman terms."

🔧 Integration Options:
• Anthropic API
• Slack integrations

🔄 Known Limitations:
• Slightly less creative than GPT‑4
• Limited availability outside enterprise tools
    `
  },
  'Gemini': {
    title: 'Gemini',
    summary: "Google's multimodal AI. Great for images, docs, and web integration.",
    deep: `
🔍 Overview:
Gemini is Google DeepMind’s newest multimodal model built for text, images, audio, and video comprehension.

🧠 Strengths:
• Seamless integration of search results
• Image and document interpretation
• Powerful API via Google Cloud

💡 Best Use Cases:
• Productive research assistants
• Live visual support
• AI-powered UI/UX generation

🧪 Sample Prompts:
• "Summarize this PDF with graphs."
• "Describe what’s in this uploaded photo."

🔧 Integration Options:
• Vertex AI (Google Cloud)
• Workspace plugins (Docs, Sheets)

🔄 Known Limitations:
• Restricted in some geographies
• Requires fine-tuning for some enterprise use cases
    `
  }
};

export default aiData;