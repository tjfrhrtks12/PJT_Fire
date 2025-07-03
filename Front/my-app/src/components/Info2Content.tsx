import React, { useState } from 'react';
import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000';

type FireAddress = {
  id: number;
  address: string;
  memo: string;
  username: string;
  created_at: string;
  user_id: number;
};

type Props = {
  addresses: FireAddress[];
  fetchAddresses: () => void;
  userId: number;
  onSelect: (id: number) => void; // ✅ 선택된 ID 설정 함수
};

const Info2Content = ({ addresses, fetchAddresses, userId, onSelect }: Props) => {
  const [editId, setEditId] = useState<number | null>(null);
  const [editAddress, setEditAddress] = useState('');
  const [editMemo, setEditMemo] = useState('');

  const handleEdit = (addr: FireAddress) => {
    setEditId(addr.id);
    setEditAddress(addr.address);
    setEditMemo(addr.memo);
  };

  const handleEditSubmit = async (id: number) => {
    if (!editAddress.trim() || !userId) return;
    try {
      await axios.put(`${BASE_URL}/fire-addresses/${id}`, {
        address: editAddress,
        memo: editMemo,
        user_id: userId,
      });
      fetchAddresses();
      setEditId(null);
      setEditAddress('');
      setEditMemo('');
    } catch {
      alert('주소 수정 실패');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    try {
      await axios.delete(`${BASE_URL}/fire-addresses/${id}`);
      fetchAddresses();
    } catch {
      alert('삭제 실패');
    }
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setEditAddress('');
    setEditMemo('');
  };

  return (
    <div className="flex-1 overflow-y-auto pr-1 h-full">
      <h3 className="text-md font-semibold mb-2">등록된 화재지역</h3>
      <ul className="space-y-4">
        {addresses.map((addr) => (
          <li
            key={addr.id}
            onClick={() => onSelect(addr.id)} // ✅ 클릭 시 지도에서 선택
            className="p-3 border rounded hover:bg-gray-50 cursor-pointer"
          >
            {editId === addr.id ? (
              <div className="space-y-2">
                <textarea
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="border p-2 w-full rounded resize-none"
                  rows={2}
                />
                <textarea
                  value={editMemo}
                  onChange={(e) => setEditMemo(e.target.value)}
                  className="border p-2 w-full rounded resize-none"
                  rows={2}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditSubmit(addr.id)}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white p-2 rounded"
                  >
                    저장
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex-1 bg-gray-400 hover:bg-gray-500 text-white p-2 rounded"
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="font-semibold text-sm">{addr.address}</div>
                <div className="text-sm text-gray-600">{addr.memo}</div>
                <div className="text-xs text-gray-500">작성자: {addr.username}</div>
                <div className="text-xs text-gray-400">작성일: {addr.created_at}</div>
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // ✅ 마커 이동 막기
                      handleEdit(addr);
                    }}
                    className="text-xs text-blue-500 hover:underline"
                  >
                    수정
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // ✅ 마커 이동 막기
                      handleDelete(addr.id);
                    }}
                    className="text-xs text-red-500 hover:underline"
                  >
                    삭제
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Info2Content;