import styled from 'styled-components';

const TableWrapper = styled.div`
  padding: 4rem;
  background: white;
  color: black;
  font-family: serif;
`;

const Heading = styled.h2`
  font-size: 2.5rem;
  margin-bottom: 2rem;
  text-align: center;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 1rem;

  th, td {
    border: 1px solid black;
    padding: 1rem;
    vertical-align: top;
  }

  th {
    background-color: #f2f2f2;
    font-weight: bold;
    text-align: left;
  }

  td {
    background-color: #fff;
  }
`;

export default function CompareTable() {
  return (
    <TableWrapper>
      <Heading>AI Model Comparison</Heading>
      <Table>
        <thead>
          <tr>
            <th>Feature</th>
            <th>GPT‑4 (OpenAI)</th>
            <th>Claude 3 (Anthropic)</th>
            <th>Gemini (Google DeepMind)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Prompt Style Tips</td>
            <td>Use system prompts for behavior. Chain-of-thought works best.</td>
            <td>Ask direct, well-structured questions. Prefers full context.</td>
            <td>Visual and task-oriented prompts. Use with images/docs.</td>
          </tr>
          <tr>
            <td>Best For</td>
            <td>Coding, summarizing, chatbots, creative writing</td>
            <td>Research Q&A, compliance, enterprise use</td>
            <td>Multimodal tasks, visual search, Google Workspace</td>
          </tr>
          <tr>
            <td>Strengths</td>
            <td>Reasoning, creativity, coding, multilingual</td>
            <td>Low hallucination, high alignment, transparency</td>
            <td>PDF/image parsing, visual explanation, search integration</td>
          </tr>
          <tr>
            <td>Known Limits</td>
            <td>Can hallucinate facts. No live data.</td>
            <td>Not optimized for creative writing.</td>
            <td>Less tested outside Google Cloud. Access may vary.</td>
          </tr>
          <tr>
            <td>Popular Prompts</td>
            <td>"Summarize this text in 3 points."<br/>"Explain like I’m 5."</td>
            <td>"What does this legal paragraph mean?"<br/>"Simplify this regulation."</td>
            <td>"Describe this image."<br/>"Summarize this PDF graph."</td>
          </tr>
          <tr>
            <td>Integrations</td>
            <td>OpenAI API, Copilot, Zapier</td>
            <td>Anthropic API, Slack bots</td>
            <td>Google Cloud Vertex AI, Docs, Sheets</td>
          </tr>
          <tr>
            <td>Pricing</td>
            <td>Pay-as-you-go (API tokens), ChatGPT+</td>
            <td>Enterprise-focused</td>
            <td>Tiered plans via Google Cloud</td>
          </tr>
          <tr>
            <td>Output Tone</td>
            <td>Friendly, confident, explanatory</td>
            <td>Neutral, cautious, formal</td>
            <td>Flexible, factual, Google-style clarity</td>
          </tr>
        </tbody>
      </Table>
    </TableWrapper>
  );
}