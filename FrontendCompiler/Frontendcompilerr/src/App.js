import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './screens/Home';
import Error404 from './screens/Error404';
import { GlobalStyle } from './style/global';
import ModalProvider from './context/ModalContext';
import AIWaved from './components/AIWaved';

function App() {
  return (
    <ModalProvider>
      <BrowserRouter>
        <GlobalStyle />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<Error404 />} />
        </Routes>
        <AIWaved />
      </BrowserRouter>
    </ModalProvider>
  );
}

export default App;
