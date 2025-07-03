// src/pages/Info3Page.tsx
import React from 'react';
import NavBar from '../components/NavBar';
import { useNavigate } from 'react-router-dom';

function Info3Page() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('userId');
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ✅ NavBar에 onLogout props 전달 */}
      <NavBar onLogout={handleLogout} />

      <div className="p-10 pt-24">
        <h1 className="text-3xl font-bold mb-4">Info3Page</h1>
        <p>여기는 세 번째 정보 페이지입니다.</p>
      </div>
    </div>
  );
}

export default Info3Page;
