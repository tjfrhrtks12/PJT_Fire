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
  onSelectAddress: (addr: Address) => void;
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
  onSelectAddress
}: Props) => 
  <div className="flex flex-col h-full">
    <div className="shrink-0 space-y-2 mb-4">
      <h2 className="text-lg font-bold mb-2">주소 + 메모 입력</h2>
      <input
        type="text"
        value={inputAddress}
        onChange={onChangeAddress}
        onKeyDown={onKeyDown}
        className="border p-2 w-full rounded"
        placeholder="주소를 입력하세요"
      />
      <input
        type="text"
        value={inputMemo}
        onChange={onChangeMemo}
        onKeyDown={onKeyDown}
        className="border p-2 w-full rounded"
        placeholder="메모를 입력하세요 (예: 공사 중)"
      />
      <button
        onClick={onSubmit}
        className="w-full bg-sky-500 hover:bg-sky-600 text-white p-2 rounded"
      >
        저장
      </button>
    </div>

    <div className="flex-1 overflow-y-auto pr-1">
      <h3 className="text-md font-semibold mb-2">저장된 주소 목록</h3>
      <ul className="space-y-4">
        {addresses.map((addr) => (
          <li
            key={addr.id}
            className="p-3 border rounded hover:bg-gray-50 cursor-pointer"
            onClick={() => onSelectAddress(addr)}
          >
            <div className="font-semibold text-sm">{addr.address}</div>
            <div className="text-sm text-gray-600">{addr.memo}</div>
            <div className="text-xs text-gray-500">작성자: {addr.username}</div>
            <div className="text-xs text-gray-400">작성일: {addr.created_at}</div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(addr.id);
              }}
              className="text-xs text-red-500 mt-1 hover:underline"
            >
              삭제
            </button>
          </li>
        ))}
      </ul>
    </div>
  </div>;

export default InfoContent;
