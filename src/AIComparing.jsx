import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

const aiDetails = {
  'GPT‑4': {
    title: 'GPT‑4',
    summary: 'Advanced reasoning and creativity. Best for coding, writing, and summarizing.'
  },
  'Claude 3': {
    title: 'Claude 3',
    summary: 'Trained with high interpretability in mind. Strong at document Q&A.'
  },
  'Gemini': {
    title: 'Gemini',
    summary: "Google's multimodal AI. Great for images, docs, and web integration."
  }
};

export default function AI() {
  const [openaiLine, setOpenaiLine] = useState('');
  const navigate = useNavigate();

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

  const handleCardClick = () => {
    navigate('/compare');
  };

  return (
    <AIBlockWrapper>
      <AIHeading>murmur: AI Knowledge Platform under Construction</AIHeading>
      {openaiLine.split(/\n+/).map((line, i) => (
        <AIContent key={i}>{line.replace(/^\d+\.\s*/, '')}</AIContent>
      ))}

      <CardsWrapper>
        {Object.entries(aiDetails).map(([key, { title, summary }]) => (
          <Card key={key} onClick={handleCardClick}>
            <h3>{title}</h3>
            <p>{summary}</p>
          </Card>
        ))}
      </CardsWrapper>
    </AIBlockWrapper>
  );
}
