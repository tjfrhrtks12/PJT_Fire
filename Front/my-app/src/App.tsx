// App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import InfoPage from './pages/InfoPage';
import SelectPage from './pages/SelectPage';
import Info2Page from './pages/Info2Page';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/select" element={<SelectPage />} />
        <Route path="/info" element={<InfoPage />} />
        <Route path="/info2" element={<Info2Page />} />
      </Routes>
    </Router>
  );
}

export default App;
