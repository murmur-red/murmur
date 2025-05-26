import styled from "styled-components";

const PageWrapper = styled.div`
  min-height: 100vh;
  background: white;
  color: black;
  padding: 4rem 2rem;
  font-family: serif;
`;

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 2rem;
`;

const Section = styled.section`
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const Paragraph = styled.p`
  font-size: 1.2rem;
  line-height: 1.7;
  max-width: 800px;
`;

export default function GeminiPage() {
  return (
    <PageWrapper>
      <Title>Gemini by Google</Title>

      <Section>
        <SectionTitle>What is Gemini?</SectionTitle>
        <Paragraph>
          Gemini is Google’s flagship multimodal AI, capable of handling text, image, code, audio, and video inputs. It's designed to work across Google’s ecosystem — including Docs, Gmail, Search, and Android — making it an embedded assistant in daily tools.
        </Paragraph>
      </Section>

      <Section>
        <SectionTitle>Best Use Cases</SectionTitle>
        <Paragraph>
          Gemini excels at:
          <ul>
            <li>Visual document understanding (charts, diagrams, tables)</li>
            <li>Explaining complex multimedia data</li>
            <li>Assisting inside Google Workspace apps</li>
            <li>Fact-based research and summarization</li>
          </ul>
        </Paragraph>
      </Section>

      <Section>
        <SectionTitle>Smart Prompts</SectionTitle>
        <Paragraph>
          <strong>"Summarize this email thread and create a to-do list."</strong><br />
          <strong>"Explain this chart from my Google Doc in plain English."</strong><br />
          <strong>"Search trends from this YouTube video topic."</strong>
        </Paragraph>
      </Section>

      <Section>
        <SectionTitle>Fun Fact</SectionTitle>
        <Paragraph>
          Gemini is one of the few models that can describe what’s happening in videos — including gestures, scenes, and objects — making it uniquely capable for visual storytelling.
        </Paragraph>
      </Section>
    </PageWrapper>
  );
}
