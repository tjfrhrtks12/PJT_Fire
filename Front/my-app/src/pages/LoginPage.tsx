import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import LoginContent from '../components/LoginContent';

const BASE_URL = 'http://127.0.0.1:8000';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // ✅ 이미 로그인된 경우 select로 리디렉션
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      navigate('/select', { replace: true }); // ✅ 뒤로 가도 login 안 보이게
    }
  }, [navigate]);

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/login`, { username, password });
      localStorage.setItem('userId', String(res.data.user_id));
      navigate('/select', { replace: true }); // ✅ 로그인 성공 시에도 replace
    } catch (err: any) {
      alert(err.response?.data?.detail || '로그인 실패!');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <LoginContent
      username={username}
      password={password}
      onChangeUsername={(e) => setUsername(e.target.value)}
      onChangePassword={(e) => setPassword(e.target.value)}
      onKeyDown={handleKeyDown}
      onLogin={handleLogin}
    />
  );
}

export default LoginPage;
