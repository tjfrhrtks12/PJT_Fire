import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NavBar from '../components/NavBar';
import Info2Content from '../components/Info2Content';
import { useNavigate } from 'react-router-dom';
import FireMapView from '../components/FireMapView';

const BASE_URL = 'http://127.0.0.1:8000';

type FireAddress = {
  id: number;
  address: string;
  memo: string;
  cause: string;
  username: string;
  created_at: string;
  user_id: number;
};

type FireStation = {
  id: number;
  name: string;
  address: string;
  type: string;
};

function Info2Page() {
  const [inputAddress, setInputAddress] = useState('');
  const [inputMemo, setInputMemo] = useState('');
  const [inputCause, setInputCause] = useState('');
  const [fireAddresses, setFireAddresses] = useState<FireAddress[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [fireStations, setFireStations] = useState<FireStation[]>([]);
  const navigate = useNavigate();
  const userId = parseInt(localStorage.getItem('userId') || '0');

  useEffect(() => {
    if (!userId) {
      navigate('/login', { replace: true });
    } else {
      fetchFireAddresses();
      fetchFireStations();
    }
  }, []);

  const fetchFireAddresses = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fire-addresses`);
      setFireAddresses(res.data);
    } catch {
      alert('주소 목록 불러오기 실패');
    }
  };

  const fetchFireStations = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fire-stations`);
      setFireStations(res.data);
    } catch {
      alert('소방서 목록 불러오기 실패');
    }
  };

  const handleInputSubmit = async () => {
    if (!inputAddress.trim() || !userId) return;

    try {
      await axios.post(`${BASE_URL}/fire-addresses`, {
        address: inputAddress,
        memo: inputMemo,
        cause: inputCause,
        user_id: userId,
      });
      fetchFireAddresses();
      setInputAddress('');
      setInputMemo('');
      setInputCause('');
    } catch {
      alert('주소 저장 실패');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputSubmit();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex flex-col h-screen pt-16">
      <NavBar onLogout={handleLogout} />
      <div className="flex flex-1 bg-gray-100 h-full overflow-hidden">
        {/* 좌측 패널 */}
        <div className="w-[400px] bg-white p-6 border-r h-full flex flex-col">
          <div className="shrink-0 space-y-2 mb-4">
            <h2 className="text-lg font-bold mb-2">🔥화재 발생지역 추가</h2>
            <input
              type="text"
              value={inputAddress}
              onChange={(e) => setInputAddress(e.target.value)}
              onKeyDown={handleKeyDown}
              className="border p-2 w-full rounded"
              placeholder="주소 입력"
            />
            <input
              type="text"
              value={inputMemo}
              onChange={(e) => setInputMemo(e.target.value)}
              onKeyDown={handleKeyDown}
              className="border p-2 w-full rounded"
              placeholder="규모 입력 (예: 약불, 큰불, 화재 발생 등)"
            />
            <input
              type="text"
              value={inputCause}
              onChange={(e) => setInputCause(e.target.value)}
              className="border p-2 w-full rounded"
              placeholder="피해원인 입력"
            />

            <button
              onClick={handleInputSubmit}
              className="w-full bg-red-500 hover:bg-red-600 text-white p-2 rounded"
            >
              저장
            </button>
          </div>

          {/* ✅ 목록 클릭 시 지도 마커 선택 */}
          <Info2Content
            addresses={fireAddresses}
            fetchAddresses={fetchFireAddresses}
            userId={userId}
            onSelect={setSelectedId}
          />

          {/* 소방서 목록 출력 */}
          <div className="mt-4">
            <h3 className="font-bold mb-2">🚒 소방서 목록</h3>
            <ul className="max-h-40 overflow-y-auto text-sm">
              {fireStations.map(station => (
                <li key={station.id} className="mb-1">
                  <span className="font-semibold">{station.name}</span><br/>
                  <span className="text-gray-600">{station.address}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 우측: 지도 영역 */}
        <div className="flex-1">
          <FireMapView fireAddresses={fireAddresses} selectedId={selectedId} fireStations={fireStations} />
        </div>
      </div>
    </div>
  );
}

export default Info2Page;
