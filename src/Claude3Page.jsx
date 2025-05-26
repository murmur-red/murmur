// Claude3Page.jsx

import styled from "styled-components";

const Wrapper = styled.section`
  min-height: 100vh;
  padding: 4rem 2rem;
  background: #f9f9f9;
  color: #000;
  font-family: serif;
`;

const Heading = styled.h1`
  font-size: 2.4rem;
  margin-bottom: 1rem;
`;

const Subheading = styled.h2`
  font-size: 1.6rem;
  margin-top: 2.5rem;
  margin-bottom: 0.75rem;
`;

const Paragraph = styled.p`
  font-size: 1.1rem;
  line-height: 1.6;
  max-width: 800px;
  margin-bottom: 1rem;
`;

export default function Claude3Page() {
  return (
    <Wrapper>
      <Heading>Claude 3 Overview</Heading>
      <Paragraph>
        Claude 3 is an advanced language model developed by Anthropic. It focuses on interpretability and safe alignment. It is particularly strong in document question answering (Q&A) and producing logically structured content.
      </Paragraph>

      <Subheading>Prompt Engineering Tips</Subheading>
      <Paragraph>
        Claude 3 benefits from clarity and reasoning structure. Use numbered steps or bullet prompts. You can include your goal in the prompt to guide Claude's tone and structure.
      </Paragraph>

      <Subheading>Real Prompt Examples</Subheading>
      <Paragraph><strong>1.</strong> "Summarize this contract in plain English."
      </Paragraph>
      <Paragraph><strong>2.</strong> "Give me three potential arguments for and against this new regulation, in structured format."
      </Paragraph>

      <Subheading>Best Use Cases</Subheading>
      <Paragraph>
        - Legal document summarization
        - Research assistance
        - Creating outlines or structured essays
        - Compliance analysis
      </Paragraph>
    </Wrapper>
  );
}
