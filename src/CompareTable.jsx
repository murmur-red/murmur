import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { aiData } from './aiData';

const Wrapper = styled.div`
  background: #f9f9f9;
  color: #1a1a1a;
  font-family: 'serif';
  padding: 4rem 2rem;
  overflow-x: auto;
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

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 2rem;
`;

const Th = styled.th`
  background: black;
  color: white;
  padding: 1rem;
  text-align: left;
  border: 1px solid #ccc;
`;

const Td = styled.td`
  padding: 1rem;
  border: 1px solid #ccc;
  vertical-align: top;
  white-space: pre-line;
`;

export default function CompareTable() {
  const navigate = useNavigate();

  return (
    <Wrapper>
      <NavBar>
        <Logo>murmur</Logo>
        <BackButton onClick={() => navigate('/')}>Back to Overview</BackButton>
      </NavBar>

      <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>AI Model Comparison</h1>
      <Table>
        <thead>
          <tr>
            <Th>Aspect</Th>
            <Th>GPT-4</Th>
            <Th>Claude 3</Th>
            <Th>Gemini</Th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <Td>🧠 Core Identity</Td>
            <Td>{aiData['GPT-4'].coreIdentity}</Td>
            <Td>{aiData['Claude 3'].coreIdentity}</Td>
            <Td>{aiData['Gemini'].coreIdentity}</Td>
          </tr>
          <tr>
            <Td>💪 Strengths</Td>
            <Td>{aiData['GPT-4'].strengths}</Td>
            <Td>{aiData['Claude 3'].strengths}</Td>
            <Td>{aiData['Gemini'].strengths}</Td>
          </tr>
          <tr>
            <Td>⚠️ Limitations</Td>
            <Td>{aiData['GPT-4'].limitations}</Td>
            <Td>{aiData['Claude 3'].limitations}</Td>
            <Td>{aiData['Gemini'].limitations}</Td>
          </tr>
          <tr>
            <Td>💡 Best Use Cases</Td>
            <Td>{aiData['GPT-4'].useCases}</Td>
            <Td>{aiData['Claude 3'].useCases}</Td>
            <Td>{aiData['Gemini'].useCases}</Td>
          </tr>
          <tr>
            <Td>🛠️ Integration</Td>
            <Td>{aiData['GPT-4'].integration}</Td>
            <Td>{aiData['Claude 3'].integration}</Td>
            <Td>{aiData['Gemini'].integration}</Td>
          </tr>
          <tr>
            <Td>🎓 Educational Modules</Td>
            <Td>{aiData['GPT-4'].education}</Td>
            <Td>{aiData['Claude 3'].education}</Td>
            <Td>{aiData['Gemini'].education}</Td>
          </tr>
        </tbody>
      </Table>
    </Wrapper>
  );
}
