// src/pages/Info2Page.tsx
import NavBar from '../components/NavBar';
import { useNavigate } from 'react-router-dom';

function Info2Page() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('userId');
    navigate('/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <NavBar onLogout={handleLogout} />
      <div className="pt-20 p-6">
        <h1 className="text-2xl font-bold">🧾 Info2Page</h1>
        <p className="mt-2 text-gray-700">여기에 서브 페이지의 내용을 자유롭게 구성하실 수 있습니다.</p>
      </div>
    </div>
  );
}

export default Info2Page;
