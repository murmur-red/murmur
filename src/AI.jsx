import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AIBlockWrapper = styled.section`
  height: 100vh;
  width: 100vw;
  background: #0c0c0c;
  color: white;
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
  width: 250px;
  text-align: left;
  cursor: pointer;
  border: 2px solid black;
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
  margin-top: 1.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  background: transparent;
  border: 1px solid black;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    background: black;
    color: white;
  }
`;

const aiDetails = {
  'GPT‑4': {
    title: 'GPT‑4',
    summary: 'Advanced reasoning and creativity. Best for coding, writing, and summarizing.',
    deep: 'GPT‑4 offers API access, supports multimodal input, and excels at zero-shot and few-shot learning tasks. Use cases include code generation, legal contract analysis, and advanced tutoring bots.'
  },
  'Claude 3': {
    title: 'Claude 3',
    summary: 'Trained with high interpretability in mind. Strong at document Q&A.',
    deep: 'Claude 3 is designed to reduce hallucinations and explain its reasoning steps. It’s ideal for enterprise document search, legal/medical workflows, and collaborative assistants.'
  },
  'Gemini': {
    title: 'Gemini',
    summary: "Google's multimodal AI. Great for images, docs, and web integration.",
    deep: 'Gemini integrates deeply with Google services and supports image, text, and voice inputs. It’s powerful for education, productivity apps, and Google Workspace extensions.'
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
    const currentIndex = keys.indexOf(selectedAI);
    const prevIndex = (currentIndex - 1 + keys.length) % keys.length;
    setSelectedAI(keys[prevIndex]);
    setShowDeep(false);
  };

  const handleNext = () => {
    const keys = Object.keys(aiDetails);
    const currentIndex = keys.indexOf(selectedAI);
    const nextIndex = (currentIndex + 1) % keys.length;
    setSelectedAI(keys[nextIndex]);
    setShowDeep(false);
  };

  return (
    <AIBlockWrapper>
      <AIHeading>AI Knowledge Platform</AIHeading>
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
              <p>{showDeep ? aiDetails[selectedAI].deep : aiDetails[selectedAI].summary}</p>
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