import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import { NewFolder, NewPlayground, NewPlaygroundAndFolder, EditFolder, EditPlaygroundTitle, Loading } from './ModalTypes';
import { ModalContext } from '../context/ModalContext';

const ModalContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 2;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background-color: #fff;
  padding: 1.5rem;
  width: ${(props) => props.width || '35%'};
  min-width: 300px;
  border-radius: 10px;
  position: relative;
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const CloseButton = styled.button`
  background: transparent;
  outline: 0;
  border: 0;
  font-size: 2rem;
  cursor: pointer;
`;

export const Input = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  padding: 1.5rem 0;
  gap: 2rem;
  padding-bottom: 0;

  input {
    flex-grow: 1;
    height: 2rem;
  }

  button {
    background: #241f21;
    height: 2.5rem;
    color: white;
    padding: 0.3rem 2rem;
  }
`;

const Modal = () => {
  const [modalDimensions, setModalDimensions] = useState({ width: '35%', height: 'auto' });  
  const handleMouseDown = (e, direction) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = e.target.parentNode.offsetWidth;
    const startHeight = e.target.parentNode.offsetHeight;

    const doDrag = (e) => {
      e.preventDefault(); // Prevent default behavior to allow resizing
      let newWidth = startWidth;
      let newHeight = startHeight;

      if (direction.includes('right')) {
        newWidth = Math.max(300, startWidth + e.clientX - startX); // Ensure minimum width
      }
      if (direction.includes('bottom')) {
        newHeight = Math.max(100, startHeight + e.clientY - startY); // Ensure minimum height
      }
      setModalDimensions({ width: `${newWidth}px`, height: `${newHeight}px` });
    };

    const stopDrag = () => {
      document.removeEventListener('mousemove', doDrag);
      document.removeEventListener('mouseup', stopDrag);
    };

    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', stopDrag);
  };


  const { isOpenModal } = useContext(ModalContext);
  const { modalType } = isOpenModal;

  return (
    <ModalContainer>
      <ModalContent style={{ width: modalDimensions.width, height: modalDimensions.height }}>
        {/* Resize Handles */}
        <div onMouseDown={(e) => handleMouseDown(e, 'right')} style={{ cursor: 'ew-resize', width: '10px', height: '100%', position: 'absolute', right: 0, top: 0 }} />
        <div onMouseDown={(e) => handleMouseDown(e, 'bottom')} style={{ cursor: 'ns-resize', width: '100%', height: '10px', position: 'absolute', left: 0, bottom: 0 }} />
        <div onMouseDown={(e) => handleMouseDown(e, 'bottom-right')} style={{ cursor: 'nwse-resize', width: '10px', height: '10px', position: 'absolute', right: 0, bottom: 0 }} />

        {modalType === 1 && <NewFolder />}
        {modalType === 2 && <NewPlayground />}
        {modalType === 3 && <NewPlaygroundAndFolder />}
        {modalType === 4 && <EditFolder />}
        {modalType === 5 && <EditPlaygroundTitle />}
        {modalType === 6 && <Loading />}
      </ModalContent>
    </ModalContainer>
  );
};

export default Modal;
