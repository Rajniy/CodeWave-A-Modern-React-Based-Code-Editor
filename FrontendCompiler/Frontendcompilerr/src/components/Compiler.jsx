import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { FaHtml5, FaCss3Alt, FaJsSquare, FaPlayCircle } from "react-icons/fa";

const glow = keyframes`
  0% {
    box-shadow: 0 0 5px #009fe3;
  }
  50% {
    box-shadow: 0 0 20px #00c0b8;
  }
  100% {
    box-shadow: 0 0 5px #009fe3;
  }
`;

const Container = styled.div`
  display: flex;
  height: 100vh;
  flex-direction: column;
  overflow: hidden;
  background: #1e1e1e;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.7);
  max-width: 1200px;
  width: 100%;
`;

const EditorsContainer = styled.div`
  display: flex;
  height: ${(props) => props.editorHeight}px;
  gap: 15px;
  padding: 15px;
  background: #111111;
  overflow: hidden;
  border-radius: 12px 12px 0 0;
`;

const EditorWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const LabelContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

const Label = styled.label`
  color: #cbd5e1;
  font-weight: 600;
  font-size: 1rem;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  margin-left: 8px;
`;

const TextArea = styled.textarea`
  flex: 1;
  background: #121224;
  color: #e0e0e0;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-family: "Fira Code", monospace, monospace;
  font-size: 15px;
  resize: none;
  overflow: auto;
  box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.7);
  transition: background-color 0.3s ease;

  &:focus {
    outline: none;
    background-color: #1a1a2e;
    box-shadow: 0 0 8px #009fe3;
  }
`;

const OutputSection = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  background: #f9fafb;
  border-radius: 0 0 12px 12px;
  box-shadow: inset 0 0 10px #d1d5db;
  position: relative;
  overflow: hidden;
`;

const OutputHeader = styled.div`
  padding: 12px 20px;
  background: #009fe3;
  color: white;
  font-weight: 700;
  border-top: 1px solid #007bbf;
  border-radius: 0 0 0 0;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const OutputIcon = styled(FaPlayCircle)`
  font-size: 1.5rem;
  animation: ${glow} 3s ease-in-out infinite;
`;

const OutputContainer = styled.div`
  flex: 1;
  background: white;
  overflow: hidden;
  margin: 10px 15px 15px 15px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 159, 227, 0.3);
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 0 20px #00c0b8;
  }
`;

const ResizeHandle = styled.div`
  height: 12px;
  background: #009fe3;
  cursor: row-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0 0 12px 12px;
  transition: background-color 0.3s ease;

  &:hover {
    background: #007bbf;
  }
`;

const HandleIcon = styled.div`
  width: 40px;
  height: 4px;
  background: #c7d2fe;
  border-radius: 3px;
`;

const Iframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 8px;
`;

const Compiler = () => {
  const [html, setHtml] = useState("<h1>Hello World</h1>");
  const [css, setCss] = useState("h1 { color: blue; }");
  const [js, setJs] = useState('console.log("Hello from JS");');
  const [srcDoc, setSrcDoc] = useState("");
  const [editorHeight, setEditorHeight] = useState(window.innerHeight * 0.6);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const source = `
        <html>
          <head>
            <style>${css}</style>
          </head>
          <body>
            ${html}
            <script>
              ${js}
            </script>
          </body>
        </html>
      `;
      setSrcDoc(source);
    }, 250);

    return () => clearTimeout(timeout);
  }, [html, css, js]);

  const startResizing = React.useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = React.useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = React.useCallback(
    (mouseMoveEvent) => {
      if (isResizing && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const newHeight = mouseMoveEvent.clientY - containerRect.top;
        setEditorHeight(
          Math.max(150, Math.min(window.innerHeight - 150, newHeight))
        );
      }
    },
    [isResizing]
  );

  React.useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  return (
    <Container ref={containerRef}>
      <EditorsContainer editorHeight={editorHeight}>
        <EditorWrapper>
          <LabelContainer>
            <FaHtml5 color="#e34c26" size={20} />
            <Label>HTML</Label>
          </LabelContainer>
          <TextArea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            spellCheck="false"
          />
        </EditorWrapper>
        <EditorWrapper>
          <LabelContainer>
            <FaCss3Alt color="#264de4" size={20} />
            <Label>CSS</Label>
          </LabelContainer>
          <TextArea
            value={css}
            onChange={(e) => setCss(e.target.value)}
            spellCheck="false"
          />
        </EditorWrapper>
        <EditorWrapper>
          <LabelContainer>
            <FaJsSquare color="#f0db4f" size={20} />
            <Label>JavaScript</Label>
          </LabelContainer>
          <TextArea
            value={js}
            onChange={(e) => setJs(e.target.value)}
            spellCheck="false"
          />
        </EditorWrapper>
      </EditorsContainer>
      <ResizeHandle onMouseDown={startResizing}>
        <HandleIcon />
      </ResizeHandle>
      <OutputSection>
        <OutputHeader>
          <OutputIcon />
          Output
        </OutputHeader>
        <OutputContainer>
          <Iframe
            srcDoc={srcDoc}
            sandbox="allow-scripts allow-same-origin"
            title="output"
            frameBorder="0"
            scrolling="auto"
          />
        </OutputContainer>
      </OutputSection>
    </Container>
  );
};

export default Compiler;
