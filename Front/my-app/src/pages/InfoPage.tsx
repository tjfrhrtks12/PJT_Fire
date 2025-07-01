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
  isDeletable?: boolean; // 사용자가 추가한 주소인지 판별
};

function InfoPage() {
  const [inputAddress, setInputAddress] = useState('');
  const [inputMemo, setInputMemo] = useState('');
  // 기본 주소와 사용자 추가 주소를 구분하여 상태 관리
  const [defaultAddresses, setDefaultAddresses] = useState<Address[]>([]);
  const [userAddresses, setUserAddresses] = useState<Address[]>([]);
  
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const navigate = useNavigate();
  const userId = parseInt(localStorage.getItem('userId') || '0');
  
    // 기본 주소와 사용자 주소를 합친 전체 목록
  const allAddresses = [
    ...defaultAddresses.map(addr => ({ ...addr, isDeletable: false })),
    ...userAddresses.map(addr => ({ ...addr, isDeletable: true })),
  ];

  useEffect(() => {
    if (!userId) {
      navigate('/login', { replace: true });
    } else {
      fetchAllAddresses();
    }
  }, [userId]);

  const fetchAllAddresses = async () => {
    try {
      const [defaultRes, userRes] = await Promise.all([
        axios.get(`${BASE_URL}/default-addresses`),
        axios.get(`${BASE_URL}/users/${userId}/addresses`)
      ]);
      setDefaultAddresses(defaultRes.data);
      setUserAddresses(userRes.data);
    } catch {
      alert('주소 목록을 불러오는 데 실패했습니다.');
    }
  };

  const handleInputSubmit = async () => {
    if (!inputAddress.trim() || !userId) return;

    try {
      await axios.post(`${BASE_URL}/users/${userId}/addresses`, {
        address: inputAddress,
        memo: inputMemo,
      });
      fetchAllAddresses();
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
      await axios.delete(`${BASE_URL}/user-addresses/${id}`);
      fetchAllAddresses();
    } catch {
      alert('삭제 실패');
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <NavBar onLogout={handleLogout} />
      <div className="flex flex-1 bg-gray-100 h-full overflow-hidden">
        <div className="w-[400px] bg-white p-6 border-r h-full">
          <InfoContent
            inputAddress={inputAddress}
            inputMemo={inputMemo}
            onChangeAddress={(e) => setInputAddress(e.target.value)}
            onChangeMemo={(e) => setInputMemo(e.target.value)}
            onKeyDown={handleKeyDown}
            onSubmit={handleInputSubmit}
            addresses={allAddresses}
            onDelete={handleDelete}
            onSelectAddress={setSelectedAddress}
          />
        </div>
        <div className="flex-1">
          <MapView addresses={allAddresses} selectedAddress={selectedAddress} />
        </div>
      </div>
    </div>
  );
}

export default InfoPage;
