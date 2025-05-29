import styled from 'styled-components';
import { Link } from 'react-router-dom';

const PageWrapper = styled.div`
  background: #f9f9f9;
  color: #1a1a1a;
  font-family: 'serif';
  height: 100vh;
  overflow-y: auto;
`;

const StickyHeader = styled.header`
  position: sticky;
  top: 0;
  background: white;
  border-bottom: 1px solid #ddd;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
`;

const Logo = styled.h1`
  font-size: 1.4rem;
`;

const NavButton = styled(Link)`
  background: black;
  color: white;
  padding: 0.5rem 1rem;
  text-decoration: none;
  border-radius: 8px;
  font-size: 0.9rem;
`;

const Section = styled.section`
  padding: 4rem 2rem;
  max-width: 900px;
  margin: 0 auto;
`;

const Title = styled.h2`
  font-size: 2.2rem;
  margin-bottom: 1.2rem;
`;

const Subtitle = styled.h3`
  font-size: 1.4rem;
  margin: 1.6rem 0 0.8rem;
`;

const List = styled.ul`
  list-style-type: disc;
  margin-left: 1.5rem;
`;

export default function GPT4Page() {
  return (
    <PageWrapper>
      <StickyHeader>
        <Logo>GPT‑4</Logo>
        <NavButton to="/">Back to Overview</NavButton>
      </StickyHeader>

      <Section>
        <Title>GPT‑4 — Blueprint</Title>

        <Subtitle>🔍 Core Identity</Subtitle>
        <p>OpenAI’s flagship large language model, designed for reasoning, creativity, and deep contextual understanding. It is the most advanced and widely used LLM today.</p>

        <Subtitle>🧠 Strengths</Subtitle>
        <List>
          <li>Code generation, debugging, and explanations</li>
          <li>Creative writing and content ideation</li>
          <li>Multilingual and style-adaptive responses</li>
        </List>

        <Subtitle>⚠️ Limitations</Subtitle>
        <List>
          <li>Can hallucinate facts or citations</li>
          <li>Limited access to up-to-date web info unless integrated</li>
          <li>Some inconsistency with long outputs</li>
        </List>

        <Subtitle>💡 Best Use Cases</Subtitle>
        <List>
          <li>Conversational AI tools and assistants</li>
          <li>Technical summarization and document processing</li>
          <li>Idea generation, brainstorming, and prototyping</li>
        </List>

        <Subtitle>🛠️ API & Platform Behavior</Subtitle>
        <List>
          <li>Access via OpenAI’s API and Azure OpenAI</li>
          <li>Context window up to 32K tokens</li>
          <li>Compatible with function calling and tool use</li>
        </List>

        <Subtitle>📚 Educational Modules</Subtitle>
        <List>
          <li>Prompt engineering playground</li>
          <li>System prompt training vs. user instruction demos</li>
          <li>Multi-step reasoning challenges</li>
        </List>
      </Section>
    </PageWrapper>
  );
}