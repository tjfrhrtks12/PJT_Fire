import React from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import OldBuildingBlocksMap from '../components/OldBuildingBlocksMap';

const Info3Page: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('userId');
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <NavBar onLogout={handleLogout} />

      {/* ▼▼▼ 지도 크기 조절을 위해 수정된 부분 ▼▼▼ */}
      {/* 메인 컨텐츠 영역에 패딩(p-8)을 추가하고, 컨텐츠를 중앙 정렬합니다. */}
      <main className="flex-grow p-20 flex justify-center items-center">
        {/* 지도를 감싸는 컨테이너에 그림자와 둥근 모서리 효과를 줍니다. */}
        <div className="w-full h-full rounded-lg shadow-xl overflow-hidden">
          <OldBuildingBlocksMap />
        </div>
      </main>
    </div>
  );
};

export default Info3Page;