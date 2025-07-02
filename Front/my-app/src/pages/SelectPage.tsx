import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import NavBar from '../components/NavBar';

function SelectPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('userId');
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <NavBar onLogout={handleLogout} />

      {/* ✅ Hero Section만 추가 */}
      <div className="pt-24 pb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">🚨 재난 위험지역 시스템</h1>
        <p className="text-gray-600 text-lg">주소를 등록하고 지도에서 위험 지역을 확인해보세요.</p>
      </div>

      {/* ✅ 기존 선택 영역은 그대로 */}
      <div className="flex flex-1 flex-col items-center justify-center pt-10">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">이동할 페이지를 선택하세요</h1>
        <div className="space-y-4">
          <button
            onClick={() => navigate('/info')}
            className="bg-sky-500 text-white px-6 py-3 rounded hover:bg-sky-600 w-64"
          >
            📍 주소 및 재난 정보 페이지
          </button>
          <button
            onClick={() => navigate('/info2')}
            className="bg-indigo-500 text-white px-6 py-3 rounded hover:bg-indigo-600 w-64"
          >
            🧾 Info2Page (서브 페이지)
          </button>
        </div>
      </div>
    </div>
  );
}

export default SelectPage;
