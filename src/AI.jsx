import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AIBlockWrapper = styled.section`
  height: 100vh;
  width: 100vw;
  background: white;
  color: black;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 2rem;
  font-family: serif;
`;

const AIHeading = styled.h2`
  font-size: 2.4rem;
  margin-bottom: 1.5rem;
`;

const AIContent = styled.p`
  font-size: 1.2rem;
  max-width: 800px;
  line-height: 1.6;
`;

const CardsWrapper = styled.div`
  display: flex;
  gap: 2rem;
  margin-top: 3rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const Card = styled.div`
  background: white;
  color: black;
  padding: 2rem;
  border-radius: 12px;
  border: 2px solid black;
  width: 250px;
  text-align: left;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.25);
  }
`;

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
`;

const ModalContent = styled(motion.div)`
  background: white;
  color: black;
  padding: 2.5rem;
  border-radius: 16px;
  max-width: 600px;
  text-align: left;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 16px;
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
`;

const DiveDeeperButton = styled.button`
  margin-top: 1.5rem;
  padding: 0.75rem 1.5rem;
  background-color: black;
  color: white;
  border: 2px solid white;
  border-radius: 10px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: white;
    color: black;
  }
`;

const ModalNavButton = styled.button`
  margin-top: 1rem;
  background: none;
  border: none;
  color: black;
  font-size: 1rem;
  cursor: pointer;
`;

const aiDetails = {
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

export default function AI() {
  const [openaiLine, setOpenaiLine] = useState('');
  const [selectedAI, setSelectedAI] = useState(null);
  const [showDeep, setShowDeep] = useState(false);

  useEffect(() => {
    fetch('http://localhost:4000/api/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })
      .then(res => res.json())
      .then(data => setOpenaiLine(data.result || '...'))
      .catch(() => setOpenaiLine('AI is thinking weird stuff today...'));
  }, []);

  const handlePrev = () => {
    const keys = Object.keys(aiDetails);
    const index = keys.indexOf(selectedAI);
    const prevIndex = (index - 1 + keys.length) % keys.length;
    setSelectedAI(keys[prevIndex]);
    setShowDeep(false);
  };

  const handleNext = () => {
    const keys = Object.keys(aiDetails);
    const index = keys.indexOf(selectedAI);
    const nextIndex = (index + 1) % keys.length;
    setSelectedAI(keys[nextIndex]);
    setShowDeep(false);
  };

  return (
    <AIBlockWrapper>
      <AIHeading>murmur: AI Knowledge Platform in Construction</AIHeading>
      {openaiLine.split(/\n+/).map((line, i) => (
        <AIContent key={i}>{line.replace(/^\d+\.\s*/, '')}</AIContent>
      ))}

      <CardsWrapper>
        {Object.entries(aiDetails).map(([key, { title, summary }]) => (
          <Card key={key} onClick={() => setSelectedAI(key)}>
            <h3>{title}</h3>
            <p>{summary}</p>
          </Card>
        ))}
      </CardsWrapper>

      <AnimatePresence>
        {selectedAI && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedAI(null)}
          >
            <ModalContent
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <CloseButton onClick={() => setSelectedAI(null)}>×</CloseButton>
              <h2>{aiDetails[selectedAI].title}</h2>
              <p style={{ whiteSpace: 'pre-line' }}>
                {showDeep ? aiDetails[selectedAI].deep : aiDetails[selectedAI].summary}
              </p>
              <DiveDeeperButton onClick={() => setShowDeep(prev => !prev)}>
                {showDeep ? 'Show Less' : 'Dive Deeper'}
              </DiveDeeperButton>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <ModalNavButton onClick={handlePrev}>← Previous</ModalNavButton>
                <ModalNavButton onClick={handleNext}>Next →</ModalNavButton>
              </div>
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </AIBlockWrapper>
  );
}