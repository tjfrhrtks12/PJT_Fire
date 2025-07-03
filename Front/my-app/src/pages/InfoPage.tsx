import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from '../components/NavBar';
import InfoContent from '../components/InfoContent'; 
import MapView from '../components/MapView';

const BASE_URL = 'http://127.0.0.1:8000';

type Address = {
  id: number;
  address: string;
  memo: string;
  username: string;
  created_at: string;
  user_id: number;
};

function InfoPage() {
  const [inputAddress, setInputAddress] = useState('');
  const [inputMemo, setInputMemo] = useState('');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      navigate('/login', { replace: true });
    } else {
      fetchAddresses();
    }
  }, []);

  const userId = parseInt(localStorage.getItem('userId') || '0');

  const fetchAddresses = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/addresses`);
      setAddresses(res.data);
    } catch {
      alert('주소 목록 불러오기 실패');
    }
  };

  const handleInputSubmit = async () => {
    if (!inputAddress.trim() || !userId) return;

    try {
      await axios.post(`${BASE_URL}/addresses`, {
        address: inputAddress,
        memo: inputMemo,
        user_id: userId,
      });
      fetchAddresses();
      setInputAddress('');
      setInputMemo('');
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

  const handleDelete = async (id: number) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    try {
      await axios.delete(`${BASE_URL}/addresses/${id}`);
      fetchAddresses();
    } catch {
      alert('삭제 실패');
    }
  };

  return (
    <div className="flex flex-col h-screen pt-16">
      <NavBar onLogout={handleLogout} />
      <div className="flex flex-1 bg-gray-100 h-full overflow-hidden">
        <div className="w-[400px] bg-white p-6 border-r h-full flex flex-col">
          <div className="shrink-0 space-y-2 mb-4">
            <h2 className="text-lg font-bold mb-2">새 정보 추가</h2>
            <input
              type="text"
              value={inputAddress}
              onChange={(e) => setInputAddress(e.target.value)}
              onKeyDown={handleKeyDown}
              className="border p-2 w-full rounded"
              placeholder="주소를 입력하세요"
            />
            <input
              type="text"
              value={inputMemo}
              onChange={(e) => setInputMemo(e.target.value)}
              onKeyDown={handleKeyDown}
              className="border p-2 w-full rounded"
              placeholder="메모를 입력하세요 (예: 공사 중)"
            />
            <button
              onClick={handleInputSubmit}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white p-2 rounded"
            >
              저장
            </button>
          </div>
          <div className="flex-1 min-h-0 h-full">
            <InfoContent
              addresses={addresses}
              onDelete={handleDelete}
              onSelectAddress={setSelectedAddress}
              fetchAddresses={fetchAddresses}
              userId={userId}
            />
          </div>
        </div>
        <div className="flex-1">
          <MapView addresses={addresses} selectedAddress={selectedAddress} />
        </div>
      </div>
    </div>
  );
}

export default InfoPage;
