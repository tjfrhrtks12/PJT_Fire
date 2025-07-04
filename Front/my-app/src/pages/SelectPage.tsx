import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';

function SelectPage() {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

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

      <div className="flex flex-col lg:flex-row justify-center items-start flex-1 mt-32 gap-4 mx-10">
        {/* 히어로 이미지 */}
        <div className="w-full lg:w-[1040px] aspect-video relative rounded-2xl overflow-hidden shadow-xl">
          <img
            src="/images/fire_hero.jpg"
            alt="재난 대응 이미지"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black opacity-30" />
        </div>

        {/* 카드 영역 */}
        <div className="flex flex-col gap-4 h-full justify-between lg:h-[585px] transition-all duration-500">
          {/* 카드 1 */}
          <div
            onClick={() => navigate('/info')}
            className={`cursor-pointer bg-gray-400 rounded-2xl shadow-md px-8 py-6 w-full sm:w-[280px] md:w-[300px] lg:w-72 transition-all duration-500 flex flex-col justify-center
              ${hoveredCard ? 'h-[150px]' : 'h-[585px]'}`}
          >
            <div className="text-xl font-bold text-black mb-2">위험 대응 통합 지도</div>
            {!hoveredCard && (
              <p className="text-black text-sm">
                "사용자 제보, 응급시설, 재난문자를 한눈에 보는 위험 대응 통합 플랫폼"
              </p>
            )}
          </div>

          {/* 카드 2 & 3 컨테이너 */}
          <div className="flex flex-col gap-5 justify-center h-[585px] transition-all duration-500">
            {/* 카드 2 */}
            <div
              onClick={() => navigate('/info2')}
              onMouseEnter={() => setHoveredCard('card2')}
              onMouseLeave={() => setHoveredCard(null)}
              className={`cursor-pointer bg-gray-300 rounded-2xl shadow-md px-8 py-6 w-full sm:w-[280px] md:w-[300px] lg:w-72 transition-all duration-500 
                ${hoveredCard === 'card2' ? 'h-[300px]' : 'h-[120px]'}`}
            >
              <div className="text-xl font-bold text-gray-700 mb-2">화재 대응 위치 지도</div>
              <p className={`text-gray-700 text-sm transition-opacity duration-300 ${hoveredCard === 'card2' ? 'opacity-100' : 'opacity-0'}`}>
                "사용자 제보 화재 위치와 전국 소방서를 함께 표시하는 위치 기반 대응 지도"
              </p>
            </div>

            {/* 카드 3 */}
            <div
              onClick={() => navigate('/info3')}
              onMouseEnter={() => setHoveredCard('card3')}
              onMouseLeave={() => setHoveredCard(null)}
              className={`cursor-pointer bg-gray-300 rounded-2xl shadow-md px-8 py-6 w-full sm:w-[280px] md:w-[300px] lg:w-72 transition-all duration-500
                ${hoveredCard === 'card3' ? 'h-[300px]' : 'h-[120px]'}`}
            >
              <div className="text-xl font-bold text-gray-700 mb-2">노후 건물 시각화 지도</div>
              <p className={`text-gray-700 text-sm transition-opacity duration-300 ${hoveredCard === 'card3' ? 'opacity-100' : 'opacity-0'}`}>
                "구별 노후 건물 분포를 색상으로 시각화한 도시 위험도 분석 지도"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SelectPage;
