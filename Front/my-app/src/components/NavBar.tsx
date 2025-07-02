import React from 'react';
import { useNavigate } from 'react-router-dom';

type NavBarProps = {
  onLogout: () => void;
};

const NavBar: React.FC<NavBarProps> = ({ onLogout }) => {
  const navigate = useNavigate();

  return (
    <nav className="flex justify-between items-center bg-white text-gray-800 px-6 py-3 fixed top-0 left-0 w-full z-10">
      <div
        className="text-2xl font-bold cursor-pointer hover:text-gray-600 transition"
        onClick={() => navigate('/select')}
      >
        😎권나박진
      </div>
      <button
        onClick={onLogout}
        className="hover:text-gray-600 transition"
      >
        LOGOUT
      </button>
    </nav>
  );
};

export default NavBar;
