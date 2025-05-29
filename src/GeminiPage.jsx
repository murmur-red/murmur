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

export default function GeminiPage() {
  return (
    <PageWrapper>
      <Title>Gemini — Blueprint</Title>

      <Section>
        <Subtitle>🔍 Core Identity</Subtitle>
        <p>Google DeepMind’s multimodal model designed for seamless use across text, images, code, and more. Aims to integrate AI directly into your productivity and research workflows.</p>
      </Section>

      <Section>
        <Subtitle>🧠 Strengths</Subtitle>
        <List>
          <li>Multimodal capabilities (text, image, audio, video)</li>
          <li>Search-native understanding</li>
          <li>Ideal for productivity tools and contextual assistance</li>
        </List>
        <Subtitle>⚠️ Limitations</Subtitle>
        <List>
          <li>Less consistent in longform logic reasoning</li>
          <li>Still experimental in some geographies</li>
          <li>Less transparency around architecture</li>
        </List>
      </Section>

      <Section>
        <Subtitle>💡 Best Use Cases</Subtitle>
        <List>
          <li>Research copilots</li>
          <li>Real-time web content summarization</li>
          <li>Document and image ingestion</li>
        </List>
      </Section>

      <Section>
        <Subtitle>🛠️ API & Platform Behavior</Subtitle>
        <List>
          <li>Vertex AI integration (Google Cloud)</li>
          <li>Connected to Workspace (Docs, Sheets, Gmail)</li>
          <li>Google Lens-style functionality in dev</li>
        </List>
      </Section>

      <Section>
        <Subtitle>📚 Educational Modules</Subtitle>
        <List>
          <li>Multimodal input experiments</li>
          <li>Gemini sandbox prompt lab</li>
          <li>Content-aware spreadsheet automation</li>
        </List>
      </Section>
    </PageWrapper>
  );
}