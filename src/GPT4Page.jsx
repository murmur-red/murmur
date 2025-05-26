import styled from 'styled-components';

const Wrapper = styled.div`
  min-height: 100vh;
  padding: 4rem 2rem;
  background: white;
  color: black;
  font-family: serif;
`;

const Section = styled.section`
  max-width: 800px;
  margin: 0 auto 4rem auto;
`;

const Heading = styled.h2`
  font-size: 2.4rem;
  margin-bottom: 1rem;
`;

const Paragraph = styled.p`
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const List = styled.ul`
  padding-left: 1.5rem;
`;

const ListItem = styled.li`
  margin-bottom: 0.75rem;
`;

export default function GPT4Page() {
  return (
    <Wrapper>
      <Section>
        <Heading>GPT‑4 Overview</Heading>
        <Paragraph>
          GPT‑4 is OpenAI's most advanced language model, known for its reasoning ability, fluency, and versatility. It can handle complex tasks in writing, code generation, summarization, and creative ideation.
        </Paragraph>
      </Section>

      <Section>
        <Heading>Prompt Engineering Tips</Heading>
        <List>
          <ListItem>Be explicit about the style and tone you want.</ListItem>
          <ListItem>Use delimiters (like triple quotes) for clarity.</ListItem>
          <ListItem>Chain-of-thought prompts improve reasoning.</ListItem>
        </List>
      </Section>

      <Section>
        <Heading>Example Prompts</Heading>
        <List>
          <ListItem>"Summarize this article in 3 sentences, then give it a sarcastic title."</ListItem>
          <ListItem>"Write a Python function that detects duplicates in a list."</ListItem>
          <ListItem>"Explain quantum computing like I’m 12."</ListItem>
        </List>
      </Section>

      <Section>
        <Heading>Best Use Cases</Heading>
        <List>
          <ListItem>Startup idea brainstorming</ListItem>
          <ListItem>Advanced content rewriting</ListItem>
          <ListItem>Conversational UX for apps and bots</ListItem>
        </List>
      </Section>
    </Wrapper>
  );
}
