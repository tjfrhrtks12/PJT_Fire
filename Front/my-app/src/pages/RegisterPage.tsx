import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!username || !password) {
      alert('아이디와 비밀번호를 모두 입력하세요.');
      return;
    }

    try {
      await axios.post(`${BASE_URL}/register`, {
        username,
        password,
      });
      alert('회원가입 완료! 로그인 페이지로 이동합니다.');
      navigate('/login');
    } catch (err: any) {
      const msg = err.response?.data?.detail || '회원가입 실패';
      alert(msg);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleRegister();
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-sm bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">회원가입</h2>
        <input
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={handleKeyDown}
          className="border p-2 mb-4 w-full rounded"
        />
        <input
          placeholder="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          className="border p-2 mb-4 w-full rounded"
        />
        <button
          onClick={handleRegister}
          className="bg-sky-300 hover:bg-sky-400 text-white p-2 rounded w-full"
        >
          회원가입
        </button>


        <div className="mt-4 text-center text-sm text-gray-500">
          이미 계정이 있으신가요?{' '}
          <span
            onClick={() => navigate('/login')}
            className="text-blue-500 hover:underline cursor-pointer"
          >
            로그인
          </span>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
