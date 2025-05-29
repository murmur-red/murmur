import styled from 'styled-components';

const PageWrapper = styled.div`
  min-height: 100vh;
  width: 100%;
  background: #f9f9f9;
  color: #1a1a1a;
  font-family: 'serif';
  padding: 4rem;
  line-height: 1.7;
  max-width: 900px;
  margin: 0 auto;
  overflow-y: auto;
`;
const Section = styled.section`
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 2.6rem;
  margin-bottom: 1.2rem;
`;

const Subtitle = styled.h2`
  font-size: 1.6rem;
  margin: 1.6rem 0 0.8rem;
`;

const List = styled.ul`
  list-style-type: disc;
  margin-left: 1.5rem;
`;

export default function GPT4Page() {
  return (
    <PageWrapper>
      <Title>GPT‑4 — Blueprint</Title>

      <Section>
        <Subtitle>🔍 Core Identity</Subtitle>
        <p>OpenAI’s most powerful and general-purpose model, capable of complex reasoning, creative output, and advanced problem solving.</p>
      </Section>

      <Section>
        <Subtitle>🧠 Strengths</Subtitle>
        <List>
          <li>Creative writing and storytelling</li>
          <li>Highly effective in coding and debugging tasks</li>
          <li>Multilingual capabilities and rich contextual memory</li>
        </List>
        <Subtitle>⚠️ Limitations</Subtitle>
        <List>
          <li>Occasional hallucinations</li>
          <li>Needs prompt engineering for best results</li>
          <li>No native web access or up-to-date knowledge</li>
        </List>
      </Section>

      <Section>
        <Subtitle>💡 Best Use Cases</Subtitle>
        <List>
          <li>AI-enhanced productivity apps</li>
          <li>Education and tutoring tools</li>
          <li>Legal and scientific summarization</li>
        </List>
      </Section>

      <Section>
        <Subtitle>🛠️ API & Platform Behavior</Subtitle>
        <List>
          <li>Accessed via OpenAI API</li>
          <li>Model configuration via temperature and max tokens</li>
          <li>Integration through ChatGPT and Copilot</li>
        </List>
      </Section>

      <Section>
        <Subtitle>📚 Educational Modules</Subtitle>
        <List>
          <li>Prompt engineering playground</li>
          <li>Live creative writing challenge</li>
          <li>Debugging assistant walkthrough</li>
        </List>
      </Section>
    </PageWrapper>
  );
}