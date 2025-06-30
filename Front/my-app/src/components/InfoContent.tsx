// InfoContent.tsx
import React from 'react';

type Address = {
  id: number;
  address: string;
  memo: string;
  username: string;
  created_at: string;
};

type Props = {
  inputAddress: string;
  inputMemo: string;
  onChangeAddress: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeMemo: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  addresses: Address[];
  onDelete: (id: number) => void;
};

const InfoContent = ({
  inputAddress,
  inputMemo,
  onChangeAddress,
  onChangeMemo,
  onKeyDown,
  onSubmit,
  addresses,
  onDelete,
}: Props) => {
  return (
    <div className="pt-20 p-10 text-center">
      <h2 className="text-xl font-bold mb-4">주소 + 메모 입력</h2>

      <input
        type="text"
        value={inputAddress}
        onChange={onChangeAddress}
        onKeyDown={onKeyDown}
        className="border p-2 mb-2 w-full"
        placeholder="주소를 입력하세요"
      />
      <input
        type="text"
        value={inputMemo}
        onChange={onChangeMemo}
        onKeyDown={onKeyDown}
        className="border p-2 mb-4 w-full"
        placeholder="메모를 입력하세요 (예: 공사 중)"
      />
      <button
        onClick={onSubmit}
        className="bg-sky-300 hover:bg-sky-400 text-white p-2 rounded w-full mb-6"
      >
        저장
      </button>

      <h3 className="text-lg font-semibold mb-2">저장된 주소 목록</h3>
      <ul className="text-left list-disc pl-5">
        {addresses.map((addr) => (
          <li key={addr.id} className="mb-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-bold">{addr.address}</div>
                <div className="text-sm text-gray-600">{addr.memo}</div>
                <div className="text-xs text-gray-500">작성자: {addr.username}</div>
                <div className="text-xs text-gray-400">작성일시: {addr.created_at}</div>
              </div>
              <button
                onClick={() => onDelete(addr.id)}
                className="ml-4 text-red-500 hover:text-red-700"
              >
                삭제
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InfoContent;
