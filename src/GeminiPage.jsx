import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const PageWrapper = styled.div`
  background: #f9f9f9;
  color: #1a1a1a;
  font-family: 'serif';
  padding: 4rem;
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

const NavBar = styled.nav`
  position: sticky;
  top: 0;
  background: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ddd;
  z-index: 1000;
`;

const Logo = styled.h1`
  font-size: 1.5rem;
  font-weight: bold;
`;

const BackButton = styled.button`
  padding: 0.5rem 1rem;
  background: black;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
`;

export default function GeminiPage() {
  const navigate = useNavigate();

  return (
    <div>
      <NavBar>
        <Logo>murmur</Logo>
        <BackButton onClick={() => navigate('/')}>Back to Overview</BackButton>
      </NavBar>

      <PageWrapper>
        <Title>Gemini — Blueprint</Title>

        <Section>
          <Subtitle>🔍 Core Identity</Subtitle>
          <p>Google DeepMind’s multimodal model, built for fluid interactions across text, images, code, and video. Designed for integration across the Google ecosystem.</p>
        </Section>

        <Section>
          <Subtitle>🧠 Strengths</Subtitle>
          <List>
            <li>Multimodal reasoning (text, image, video)</li>
            <li>Strong web and document comprehension</li>
            <li>Powerful cloud-based integration options</li>
          </List>
          <Subtitle>⚠️ Limitations</Subtitle>
          <List>
            <li>Limited offline use cases</li>
            <li>Requires API access via Google Cloud</li>
            <li>Still being refined for complex workflows</li>
          </List>
        </Section>

        <Section>
          <Subtitle>💡 Best Use Cases</Subtitle>
          <List>
            <li>Multimodal knowledge agents</li>
            <li>Image-to-text productivity tools</li>
            <li>Integration into Docs, Sheets, Search</li>
          </List>
        </Section>

        <Section>
          <Subtitle>🛠️ API & Platform Behavior</Subtitle>
          <List>
            <li>Deployed via Google Vertex AI</li>
            <li>Gemini Pro and Gemini Ultra tiers</li>
            <li>Built-in prompt tuning for custom tasks</li>
          </List>
        </Section>

        <Section>
          <Subtitle>📚 Educational Modules</Subtitle>
          <List>
            <li>Live doc annotation and interaction</li>
            <li>Hands-on image querying tutorials</li>
            <li>Gemini UI playground (early beta)</li>
          </List>
        </Section>
      </PageWrapper>
    </div>
  );
}