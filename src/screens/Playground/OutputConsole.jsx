import React from 'react';
import { Console, Header, TextArea } from './InputConsole';
import { BiExport } from 'react-icons/bi';
import styled from 'styled-components';

// Styled components for steps and code display
const StepsContainer = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
`;

const Step = styled.p`
  margin: 0.5rem 0;
  padding: 0.5rem;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const CodePreview = styled.pre`
  background: #241f21;
  color: #fff;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  margin-top: 1rem;
`;

const OutputConsole = ({ response, currentOutput }) => {
  return (
    <Console>
      <Header>
        Output:
        <a
          href={`data:text/plain;charset=utf-8,${encodeURIComponent(
            response?.code || currentOutput
          )}`}
          download="output.txt"
        >
          <BiExport /> Export Output
        </a>
      </Header>

      {/* Display Implementation Steps */}
      {response?.steps && (
        <StepsContainer>
          <h3>Implementation Steps</h3>
          {response.steps.map((step, index) => (
            <Step key={index}>{step}</Step>
          ))}
        </StepsContainer>
      )}

      {/* Display Generated Code */}
      {response?.code ? (
        <CodePreview>{response.code}</CodePreview>
      ) : (
        <TextArea value={currentOutput} disabled />
      )}
    </Console>
  );
};

export default OutputConsole;