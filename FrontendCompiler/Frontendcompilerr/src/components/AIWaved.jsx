import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';
import { FaRobot } from 'react-icons/fa';

const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.7);
  }
  70% {
    transform: scale(1.05);
    box-shadow: 0 0 10px 10px rgba(0, 123, 255, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(0, 123, 255, 0);
  }
`;

const animatedRobot = keyframes`
  0%, 100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(15deg);
  }
  75% {
    transform: rotate(-15deg);
  }
`;

const ChatButton = styled.button`
  position: fixed;
  cursor: grab;
  background: linear-gradient(135deg, #4a90e2, #007bff);
  color: white;
  border: none;
  border-radius: 50%;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.6);
  transition: box-shadow 0.3s ease;
  z-index: 1000;
  animation: ${pulseAnimation} 3s infinite;

  &:hover {
    box-shadow: 0 6px 16px rgba(0, 123, 255, 0.8);
  }

  &:active {
    cursor: grabbing;
  }

  svg {
    animation: ${animatedRobot} 4s ease-in-out infinite;
    transform-origin: 50% 50%;
  }
`;

const fadeInScale = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 999;
  opacity: 0;
  animation: fadeIn 0.3s forwards;

  @keyframes fadeIn {
    to {
      opacity: 1;
    }
  }
`;

const ChatModal = styled.div`
  position: fixed;
  width: 350px;
  height: 500px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1000;
  overflow: auto;
  animation: ${fadeInScale} 0.4s ease forwards;
`;

const ResizeHandle = styled.div`
  position: absolute;
  background: transparent;
  z-index: 10;

  &.top,
  &.bottom {
    height: 8px;
    left: 0;
    right: 0;
    cursor: ns-resize;
  }

  &.top {
    top: 0;
  }

  &.bottom {
    bottom: 0;
  }

  &.left,
  &.right {
    width: 8px;
    top: 0;
    bottom: 0;
    cursor: ew-resize;
  }

  &.left {
    left: 0;
  }

  &.right {
    right: 0;
  }

  &.top-left {
    width: 12px;
    height: 12px;
    top: 0;
    left: 0;
    cursor: nwse-resize;
  }

  &.top-right {
    width: 12px;
    height: 12px;
    top: 0;
    right: 0;
    cursor: nesw-resize;
  }

  &.bottom-left {
    width: 12px;
    height: 12px;
    bottom: 0;
    left: 0;
    cursor: nesw-resize;
  }

  &.bottom-right {
    width: 12px;
    height: 12px;
    bottom: 0;
    right: 0;
    cursor: nwse-resize;
  }
`;

const ChatHeader = styled.div`
  padding: 1rem;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
  border-radius: 8px 8px 0 0;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: grab;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
`;

const ChatBody = styled.div`
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const fadeInSlide = keyframes`
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Message = styled.div`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  max-width: 80%;
  word-wrap: break-word;
  position: relative;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  animation: ${fadeInSlide} 0.3s ease forwards;

  img {
    max-width: 100%;
    max-height: 200px;
    border-radius: 4px;
    margin-top: 8px;
    object-fit: contain;
  }

  &.user {
    background: #007bff;
    color: white;
    align-self: flex-end;
    box-shadow: 0 2px 8px rgba(0, 123, 255, 0.6);
  }

  &.bot {
    background: #f1f1f1;
    color: #333;
    align-self: flex-start;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  pre {
    white-space: pre-wrap;
    font-family: 'Courier New', Courier, monospace;
    font-size: 0.8rem;
    background: rgba(0,0,0,0.05);
    padding: 0.5rem;
    border-radius: 4px;
    overflow-x: auto;
  }
`;

const Timestamp = styled.span`
  font-size: 0.7rem;
  color: #666;
  position: absolute;
  bottom: -16px;
  right: 8px;
`;

const enhancedTypingAnimation = keyframes`
  0% { opacity: 0.2; transform: translateY(0); }
  50% { opacity: 1; transform: translateY(-5px); }
  100% { opacity: 0.2; transform: translateY(0); }
`;

const TypingIndicator = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 0.5rem 1rem;
  max-width: 80%;
  background: #f1f1f1;
  border-radius: 8px;
  color: #666;
  font-style: italic;
  align-self: flex-start;

  span {
    display: inline-block;
    width: 8px;
    height: 8px;
    background: #666;
    border-radius: 50%;
    animation: ${enhancedTypingAnimation} 1.5s infinite;
  }

  span:nth-child(2) {
    animation-delay: 0.3s;
  }

  span:nth-child(3) {
    animation-delay: 0.6s;
  }
`;

const InputContainer = styled.div`
  display: flex;
  padding: 1rem;
  border-top: 1px solid #ddd;
  gap: 0.5rem;
`;

const ChatInput = styled.input`
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;

  &::placeholder {
    color: #999;
    transition: color 0.3s ease;
  }

  &:focus {
    border-color: #007bff;
    box-shadow: 0 0 5px rgba(0,123,255,0.5);

    &::placeholder {
      color: transparent;
    }
  }
`;

const FileInput = styled.label`
  padding: 0.5rem;
  background: #007bff;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  input {
    display: none;
  }
`;

const animatedSend = keyframes`
  0%, 100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(5px);
  }
`;

const SendButton = styled.button`
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    background: #0056b3;
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  &::after {
    content: '➔';
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    animation: ${animatedSend} 1.5s infinite;
  }
`;

const ScrollToBottomButton = styled.button`
  position: absolute;
  bottom: 70px;
  right: 20px;
  background: #007bff;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  color: white;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease, transform 0.2s ease;
  z-index: 1100;

  &:hover {
    background: #0056b3;
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const AIWaved = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ top: 20, left: 20 });
  const [modalPosition, setModalPosition] = useState({ top: 80, left: 20 });
  const [modalSize, setModalSize] = useState({ width: 350, height: 500 });
  const [isDraggingButton, setIsDraggingButton] = useState(false);
  const [isDraggingModal, setIsDraggingModal] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDir, setResizeDir] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [showScrollButton, setShowScrollButton] = useState(false);
  const chatBodyRef = useRef(null);

  const constrainPosition = (pos, width = 0, height = 0) => ({
    top: Math.min(Math.max(pos.top, 0), window.innerHeight - height),
    left: Math.min(Math.max(pos.left, 0), window.innerWidth - width),
  });

  const handleButtonMouseDown = useCallback((e) => {
    setIsDraggingButton(true);
    setOffset({
      x: e.clientX - buttonPosition.left,
      y: e.clientY - buttonPosition.top,
    });
  }, [buttonPosition]);

  const handleModalMouseDown = useCallback((e) => {
    if (e.target.dataset.resizeHandle) {
      setIsResizing(true);
      setResizeDir(e.target.dataset.resizeHandle);
    } else {
      setIsDraggingModal(true);
      setOffset({
        x: e.clientX - modalPosition.left,
        y: e.clientY - modalPosition.top,
      });
    }
  }, [modalPosition]);

  const handleMouseMove = useCallback((e) => {
    const constrainSize = (size) => ({
      width: Math.min(Math.max(size.width, 200), window.innerWidth - modalPosition.left),
      height: Math.min(Math.max(size.height, 200), window.innerHeight - modalPosition.top),
    });

    if (isDraggingButton) {
      const newPos = { left: e.clientX - offset.x, top: e.clientY - offset.y };
      setButtonPosition(constrainPosition(newPos, 50, 50));
    } else if (isDraggingModal) {
      const newPos = { left: e.clientX - offset.x, top: e.clientY - offset.y };
      setModalPosition(constrainPosition(newPos, modalSize.width, modalSize.height));
    } else if (isResizing && resizeDir) {
      let newWidth = modalSize.width;
      let newHeight = modalSize.height;
      let newLeft = modalPosition.left;
      let newTop = modalPosition.top;

      if (resizeDir.includes('right')) {
        newWidth = e.clientX - modalPosition.left;
      }
      if (resizeDir.includes('left')) {
        newWidth = modalSize.width + (modalPosition.left - e.clientX);
        newLeft = e.clientX;
      }
      if (resizeDir.includes('bottom')) {
        newHeight = e.clientY - modalPosition.top;
      }
      if (resizeDir.includes('top')) {
        newHeight = modalSize.height + (modalPosition.top - e.clientY);
        newTop = e.clientY;
      }

      const constrainedSize = constrainSize({ width: newWidth, height: newHeight });
      setModalSize({ width: constrainedSize.width, height: constrainedSize.height });
      setModalPosition(constrainPosition({ left: newLeft, top: newTop }, constrainedSize.width, constrainedSize.height));
    }
  }, [isDraggingButton, isDraggingModal, isResizing, resizeDir, offset, modalPosition, modalSize]);

  const handleMouseUp = useCallback(() => {
    setIsDraggingButton(false);
    setIsDraggingModal(false);
    setIsResizing(false);
    setResizeDir(null);
  }, []);

  useEffect(() => {
    if (isDraggingButton || isDraggingModal || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingButton, isDraggingModal, isResizing, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isLoading]);

  const formatCodeResponse = (text) => {
    // Split the response into sections
    const htmlMatch = text.match(/=== HTML ===([\s\S]*?)(=== CSS ===|=== JavaScript ===|$)/i);
    const cssMatch = text.match(/=== CSS ===([\s\S]*?)(=== JavaScript ===|$)/i);
    const jsMatch = text.match(/=== JavaScript ===([\s\S]*?)$/i);
    
    let formattedResponse = '';
    
    if (htmlMatch) {
      formattedResponse += `=== HTML ===\n\n${htmlMatch[1].trim()}\n\n`;
    }
    
    if (cssMatch) {
      formattedResponse += `=== CSS ===\n\n${cssMatch[1].trim()}\n\n`;
    }
    
    if (jsMatch) {
      formattedResponse += `=== JavaScript ===\n\n${jsMatch[1].trim()}\n\n`;
    }
    
    return formattedResponse || text;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, type: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5001/api/chat', {
        message: input
      }, {
        timeout: 10000
      });

      setMessages(prev => [...prev, {
        text: response.data.response,
        type: 'bot',
        timestamp: new Date()
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        text: error.response?.data?.error || 'Error communicating with AI service',
        type: 'bot',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScroll = () => {
    if (!chatBodyRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatBodyRef.current;
    setShowScrollButton(scrollTop + clientHeight < scrollHeight - 50);
  };

  const scrollToBottom = () => {
    if (!chatBodyRef.current) return;
    chatBodyRef.current.scrollTo({
      top: chatBodyRef.current.scrollHeight,
      behavior: 'smooth',
    });
    setShowScrollButton(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    setIsLoading(true);
    
    const base64Image = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  
    setMessages(prev => [...prev, {
      text: `Processing: ${file.name}`,
      type: 'user',
      image: base64Image,
      timestamp: new Date()
    }]);
  
    try {
      const formData = new FormData();
      formData.append('image', file);
  
      const response = await axios.post(
        'http://localhost:5001/api/process-image', 
        formData, 
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 60000,
          onUploadProgress: progressEvent => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log(`Upload progress: ${percentCompleted}%`);
          }
        }
      );
  
      setMessages(prev => [...prev, {
        text: formatCodeResponse(response.data.code),
        type: 'bot',
        timestamp: new Date()
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        text: error.response?.data?.error || 
             'Image processing timed out. Try a smaller image or simpler content.',
        type: 'bot',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ChatButton
        onMouseDown={handleButtonMouseDown}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          cursor: isDraggingButton ? 'grabbing' : 'grab',
          top: `${buttonPosition.top}px`,
          left: `${buttonPosition.left}px`,
        }}
      >
        <FaRobot size={24} />
      </ChatButton>

      {isOpen && (
        <>
          <Overlay onClick={() => setIsOpen(false)} />
          <ChatModal
            style={{
              top: `${modalPosition.top}px`,
              left: `${modalPosition.left}px`,
              width: `${modalSize.width}px`,
              height: `${modalSize.height}px`,
            }}
          >
            <ResizeHandle className="top" data-resize-handle="top" onMouseDown={handleModalMouseDown} />
            <ResizeHandle className="bottom" data-resize-handle="bottom" onMouseDown={handleModalMouseDown} />
            <ResizeHandle className="left" data-resize-handle="left" onMouseDown={handleModalMouseDown} />
            <ResizeHandle className="right" data-resize-handle="right" onMouseDown={handleModalMouseDown} />
            <ResizeHandle className="top-left" data-resize-handle="top-left" onMouseDown={handleModalMouseDown} />
            <ResizeHandle className="top-right" data-resize-handle="top-right" onMouseDown={handleModalMouseDown} />
            <ResizeHandle className="bottom-left" data-resize-handle="bottom-left" onMouseDown={handleModalMouseDown} />
            <ResizeHandle className="bottom-right" data-resize-handle="bottom-right" onMouseDown={handleModalMouseDown} />
            <ChatHeader onMouseDown={handleModalMouseDown}>
              AIWaved
              <CloseButton onClick={() => setIsOpen(false)}>×</CloseButton>
            </ChatHeader>
            <ChatBody ref={chatBodyRef} onScroll={handleScroll}>
              {messages.map((msg, index) => (
                <Message key={index} className={msg.type} style={{ animationDelay: `${index * 0.1}s` }}>
                  {msg.text.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line.startsWith('===') ? (
                        <strong>{line}</strong>
                      ) : (
                        line
                      )}
                      <br />
                    </React.Fragment>
                  ))}
                  {msg.image && <img src={msg.image} alt="Uploaded content" />}
                  <Timestamp>{msg.timestamp.toLocaleTimeString()}</Timestamp>
                </Message>
              ))}
              {isLoading && (
                <TypingIndicator>
                  Bot is typing
                  <span></span><span></span><span></span>
                </TypingIndicator>
              )}
            </ChatBody>
            {showScrollButton && (
              <ScrollToBottomButton onClick={scrollToBottom} title="Scroll to bottom">
                ↓
              </ScrollToBottomButton>
            )}
            <InputContainer>
              <FileInput>
                <input type="file" accept="image/*" onChange={handleFileUpload} />
                📷
              </FileInput>
              <ChatInput
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
              />
              <SendButton onClick={handleSend}>Send</SendButton>
            </InputContainer>
          </ChatModal>
        </>
      )}
    </>
  );
};

export default AIWaved;