import styled from 'styled-components';

const PageWrapper = styled.div`
  min-height: 100vh;
  padding: 4rem;
  background: #f9f9f9;
  color: #1a1a1a;
  font-family: 'serif';
  line-height: 1.7;
  max-width: 900px;
  margin: 0 auto;
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

export default function Claude3Page() {
  return (
    <PageWrapper>
      <Title>Claude 3 — Blueprint</Title>

      <Section>
        <Subtitle>🔍 Core Identity</Subtitle>
        <p>Anthropic’s flagship model, designed for interpretability, safety, and deep contextual understanding. Focuses on clarity, control, and alignment.</p>
      </Section>

      <Section>
        <Subtitle>🧠 Strengths</Subtitle>
        <List>
          <li>Long-context document Q&A (over 100K tokens)</li>
          <li>Introspective and “transparent” reasoning</li>
          <li>Ideal for safe, controlled enterprise use</li>
        </List>
        <Subtitle>⚠️ Limitations</Subtitle>
        <List>
          <li>Less creative than GPT‑4</li>
          <li>Limited public tools and API exposure</li>
          <li>Mostly focused on text – no multimodal power</li>
        </List>
      </Section>

      <Section>
        <Subtitle>💡 Best Use Cases</Subtitle>
        <List>
          <li>Legal or regulatory assistant bots</li>
          <li>Safety-aligned chat experiences</li>
          <li>Long-form analysis and structured document parsing</li>
        </List>
      </Section>

      <Section>
        <Subtitle>🛠️ API & Platform Behavior</Subtitle>
        <List>
          <li>Integrated via Anthropic API</li>
          <li>Claude model version and context length displayed</li>
          <li>Claude vs Claude Instant toggle (upcoming)</li>
        </List>
      </Section>

      <Section>
        <Subtitle>📚 Educational Modules</Subtitle>
        <List>
          <li>Claude’s "thinking step" demo</li>
          <li>Ethics-first prompt builder</li>
          <li>Interactive audit simulation</li>
        </List>
      </Section>
    </PageWrapper>
  );
}