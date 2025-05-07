import React from 'react'
import styled from 'styled-components'
import Compiler from '../../components/Compiler'
import logo from '../../assets/logo.png'

const StyledHome = styled.div`
  width: 100%;
  min-height: 100vh;
  position: relative;
  background: #1e1e1e;
  background-image: linear-gradient(to right, #00eaff, #00c0b8 50%, #007c5f 50%, #00e094);
  display: flex;
  flex-direction: column;
  align-items: center;
`

const Navbar = styled.nav`
  width: 100vw;
  height: 75px;
  background: #1e1e1e;
  box-shadow: 0 2px 8px rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 40px;
  margin-bottom: 20px;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
`

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`

const LogoImage = styled.img`
  width: 58px;
  height: 55px;
`

const LogoText = styled.h1`
  color: white;
  font-size: 2rem;
  font-weight: 700;
  user-select: none;
`

const Footer = styled.footer`
  width: 100%;
  max-width: 1200px;
  height: 40px;
  background: #111111;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 0.9rem;
  margin-top: 20px;
  border-radius: 8px;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.7);
`

const ContentWrapper = styled.div`
  width: 100%;
  max-width: 1200px;
  margin-top: 100px; /* To avoid overlap with fixed navbar */
  display: flex;
  flex-direction: column;
  align-items: center;
`

const Home = () => {
  return (
    <StyledHome>
      <Navbar>
        <LogoContainer>
          <LogoImage src={logo} alt="CodeWave Logo" />
          <LogoText>CodeWave</LogoText>
        </LogoContainer>
      </Navbar>
      <ContentWrapper>
        <Compiler />
        <Footer>© 2024 CodeWave. All rights reserved.</Footer>
      </ContentWrapper>
    </StyledHome>
  )
}

export default Home
