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

      <div className="flex flex-col lg:flex-row justify-center items-center flex-1 px-6 mt-24 gap-10">
        
        {/* 히어로 이미지 */}
        <div className="w-full lg:w-[1200px] aspect-video relative rounded-2xl overflow-hidden shadow-xl">
          <img
            src="/images/fire_hero.jpg"
            alt="재난 대응 이미지"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black opacity-30" />
        </div>

        {/* 카드 영역 */}
        <div className="w-full lg:w-auto flex flex-col gap-8 mt-8 lg:mt-0">
          {/* 카드 1 */}
          <div
            onClick={() => navigate('/info')}
            className="cursor-pointer bg-gray-200 rounded-2xl shadow-md px-8 py-12 w-full lg:w-80 hover:shadow-xl transition"
          >
            <div className="text-xl font-bold text-black mb-2">InfoPage</div>
            <p className="text-black text-sm">InfoPage</p>
          </div>

          {/* 카드 2 */}
          <div
            onClick={() => navigate('/info2')}
            className="cursor-pointer bg-gray-200 rounded-2xl shadow-md px-8 py-12 w-full lg:w-80 hover:shadow-xl transition"
          >
            <div className="text-xl font-bold text-black mb-2">Info2Page</div>
            <p className="text-black text-sm">Info2Page</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SelectPage;
