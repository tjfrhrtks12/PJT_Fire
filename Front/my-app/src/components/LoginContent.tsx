import React from 'react';

type Props = {
  username: string;
  password: string;
  onChangeUsername: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangePassword: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onLogin: () => void;
};

const LoginContent = ({
  username,
  password,
  onChangeUsername,
  onChangePassword,
  onKeyDown,
  onLogin,
}: Props) => {
  return (
    <div className="flex flex-col justify-start items-center min-h-screen bg-gray-100 pt-24">
      <img
      src="/images/logo.png"
      alt="ProT 로고"
      className="w-52 h-auto mb-4 mt-10"
      />
      <div className="w-full max-w-sm bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">로그인</h2>
        <input
          placeholder="username"
          value={username}
          onChange={onChangeUsername}
          onKeyDown={onKeyDown}
          className="border p-2 mb-4 w-full rounded"
        />
        <input
          placeholder="password"
          type="password"
          value={password}
          onChange={onChangePassword}
          onKeyDown={onKeyDown}
          className="border p-2 mb-4 w-full rounded"
        />
        <button
          onClick={onLogin}
          className="bg-gray-400 hover:bg-gray-500 text-white p-2 rounded w-full"
        >
          로그인
        </button>

        <div className="mt-4 text-center text-sm text-gray-500">
          아직 계정이 없으신가요?{' '}
          <a
            href="/register"
            className="text-blue-500 hover:underline"
          >
            회원가입
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginContent;
