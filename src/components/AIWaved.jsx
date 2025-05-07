import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { FaRobot } from 'react-icons/fa';

const ChatButton = styled.button`
  position: fixed;
  cursor: grab;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
`;

const ChatModal = styled.div`
  position: fixed;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1000;
  user-select: none;
  cursor: default;
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
  user-select: none;
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
  user-select: text;
  cursor: default;
`;

const Message = styled.div`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  max-width: 80%;
  word-wrap: break-word;
  user-select: text;

  &.user {
    background: #007bff;
    color: white;
    align-self: flex-end;
  }

  &.bot {
    background: #f1f1f1;
    color: #333;
    align-self: flex-start;
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
`;

const SendButton = styled.button`
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: #0056b3;
  }
`;

const ResizeHandle = styled.div`
  position: absolute;
  background: transparent;
  z-index: 1001;
  &.top,
  &.bottom {
    height: 8px;
    left: 8px;
    right: 8px;
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
    top: 8px;
    bottom: 8px;
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

const AIWaved = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [isDraggingButton, setIsDraggingButton] = useState(false);
  const [isDraggingModal, setIsDraggingModal] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ top: 20, left: 20 });
  const [modalPosition, setModalPosition] = useState({ top: 80, left: 20 });
  const [modalSize, setModalSize] = useState({ width: 350, height: 500 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const [isResizing, setIsResizing] = useState(false);
  const [resizeDir, setResizeDir] = useState(null);

  const constrainPosition = (pos, width = 0, height = 0) => {
    const { innerWidth, innerHeight } = window;
    return {
      top: Math.min(Math.max(pos.top, 0), innerHeight - height),
      left: Math.min(Math.max(pos.left, 0), innerWidth - width),
    };
  };

  const constrainSize = (pos, size) => {
    const { innerWidth, innerHeight } = window;
    const minWidth = 200;
    const minHeight = 200;
    const maxWidth = innerWidth - pos.left;
    const maxHeight = innerHeight - pos.top;
    return {
      width: Math.min(Math.max(size.width, minWidth), maxWidth),
      height: Math.min(Math.max(size.height, minHeight), maxHeight),
    };
  };

  const handleButtonMouseDown = useCallback((e) => {
    setIsDraggingButton(true);
    setOffset({
      x: e.clientX - buttonPosition.left,
      y: e.clientY - buttonPosition.top,
    });
  }, [buttonPosition.left, buttonPosition.top]);

  const handleHeaderMouseDown = useCallback((e) => {
    setIsDraggingModal(true);
    setOffset({
      x: e.clientX - modalPosition.left,
      y: e.clientY - modalPosition.top,
    });
  }, [modalPosition.left, modalPosition.top]);

  const handleResizeMouseDown = useCallback((e) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeDir(e.target.dataset.resizeHandle);
    setOffset({
      x: e.clientX,
      y: e.clientY,
    });
  }, []);

  const handleMouseMove = useCallback(
    (e) => {
      if (isDraggingButton) {
        const newPosition = constrainPosition({
          left: e.clientX - offset.x,
          top: e.clientY - offset.y,
        }, 50, 50);
        setButtonPosition(newPosition);
      } else if (isDraggingModal) {
        const newPosition = constrainPosition({
          left: e.clientX - offset.x,
          top: e.clientY - offset.y,
        }, modalSize.width, modalSize.height);
        setModalPosition(newPosition);
      } else if (isResizing) {
        const dx = e.clientX - offset.x;
        const dy = e.clientY - offset.y;
        let newWidth = modalSize.width;
        let newHeight = modalSize.height;
        let newLeft = modalPosition.left;
        let newTop = modalPosition.top;

        switch (resizeDir) {
          case 'right':
            newWidth = modalSize.width + dx;
            break;
          case 'left':
            newWidth = modalSize.width - dx;
            newLeft = modalPosition.left + dx;
            break;
          case 'bottom':
            newHeight = modalSize.height + dy;
            break;
          case 'top':
            newHeight = modalSize.height - dy;
            newTop = modalPosition.top + dy;
            break;
          case 'top-left':
            newWidth = modalSize.width - dx;
            newLeft = modalPosition.left + dx;
            newHeight = modalSize.height - dy;
            newTop = modalPosition.top + dy;
            break;
          case 'top-right':
            newWidth = modalSize.width + dx;
            newHeight = modalSize.height - dy;
            newTop = modalPosition.top + dy;
            break;
          case 'bottom-left':
            newWidth = modalSize.width - dx;
            newLeft = modalPosition.left + dx;
            newHeight = modalSize.height + dy;
            break;
          case 'bottom-right':
            newWidth = modalSize.width + dx;
            newHeight = modalSize.height + dy;
            break;
          default:
            break;
        }

        const constrainedSize = constrainSize({ left: newLeft, top: newTop }, { width: newWidth, height: newHeight });
        const constrainedPos = constrainPosition({ left: newLeft, top: newTop }, constrainedSize.width, constrainedSize.height);

        setModalSize(constrainedSize);
        setModalPosition(constrainedPos);

        setOffset({
          x: e.clientX,
          y: e.clientY,
        });
      }
    },
    [isDraggingButton, isDraggingModal, isResizing, offset, modalSize, modalPosition, resizeDir]
  );

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
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingButton, isDraggingModal, isResizing, handleMouseMove, handleMouseUp]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, type: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/chat', {
        message: input,
      });

      const botMessage = {
        text: response.data.response,
        type: 'bot',
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        text: 'Sorry, I encountered an error while processing your request. Please try again later.',
        type: 'bot',
      };
      setMessages((prev) => [...prev, errorMessage]);
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
          top: buttonPosition.top,
          left: buttonPosition.left,
        }}
      >
        <FaRobot size={24} />
      </ChatButton>

      {isOpen && (
        <ChatModal
          style={{
            cursor: 'default',
            top: modalPosition.top,
            left: modalPosition.left,
            width: modalSize.width,
            height: modalSize.height,
          }}
        >
          <ChatHeader onMouseDown={handleHeaderMouseDown}>
            AIWaved
            <CloseButton onClick={() => setIsOpen(false)}>×</CloseButton>
          </ChatHeader>

          <ResizeHandle className="top" data-resize-handle="top" onMouseDown={handleResizeMouseDown} />
          <ResizeHandle className="bottom" data-resize-handle="bottom" onMouseDown={handleResizeMouseDown} />
          <ResizeHandle className="left" data-resize-handle="left" onMouseDown={handleResizeMouseDown} />
          <ResizeHandle className="right" data-resize-handle="right" onMouseDown={handleResizeMouseDown} />
          <ResizeHandle className="top-left" data-resize-handle="top-left" onMouseDown={handleResizeMouseDown} />
          <ResizeHandle className="top-right" data-resize-handle="top-right" onMouseDown={handleResizeMouseDown} />
          <ResizeHandle className="bottom-left" data-resize-handle="bottom-left" onMouseDown={handleResizeMouseDown} />
          <ResizeHandle className="bottom-right" data-resize-handle="bottom-right" onMouseDown={handleResizeMouseDown} />

          <ChatBody>
              {messages.map((msg, index) => (
                <Message key={index} className={msg.type}>
                  {msg.text.split(/(```[\s\S]*?```)/g).map((segment, i) => {
                    if (segment.startsWith('```') && segment.endsWith('```')) {
                      const codeContent = segment.slice(3, -3);
                      return <pre key={i} style={{backgroundColor: '#2d2d2d', color: '#f8f8f2', padding: '1rem', borderRadius: '8px', maxWidth: '80%', overflowX: 'auto', whiteSpace: 'pre-wrap', fontFamily: "'Source Code Pro', monospace", margin: '0.5rem 0'}}>{codeContent}</pre>;
                    } else {
                      return segment.split('\n').map((line, j) => (
                        <React.Fragment key={`${i}-${j}`}>
                          {line}
                          <br />
                        </React.Fragment>
                      ));
                    }
                  })}
                </Message>
              ))}
            {isLoading && <Message className="bot">Thinking...</Message>}
          </ChatBody>
          <InputContainer>
            <ChatInput
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
            />
            <SendButton onClick={handleSend}>Send</SendButton>
          </InputContainer>
        </ChatModal>
      )}
    </>
  );
};

export default AIWaved;
