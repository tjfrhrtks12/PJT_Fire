import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from '../components/NavBar';
import InfoContent from '../components/InfoContent'; 

const BASE_URL = 'http://127.0.0.1:8000';

type Address = {
  id: number;
  address: string;
  memo: string;
  username: string;
  created_at: string;
};

function InfoPage() {
  const [inputAddress, setInputAddress] = useState('');
  const [inputMemo, setInputMemo] = useState('');
  const [addresses, setAddresses] = useState<Address[]>([]);

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
    <div>
      <NavBar onLogout={handleLogout} />

      <InfoContent
        inputAddress={inputAddress}
        inputMemo={inputMemo}
        onChangeAddress={(e) => setInputAddress(e.target.value)}
        onChangeMemo={(e) => setInputMemo(e.target.value)}
        onKeyDown={handleKeyDown}
        onSubmit={handleInputSubmit}
        addresses={addresses}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default InfoPage;
