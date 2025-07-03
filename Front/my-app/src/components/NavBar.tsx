import React from 'react';
import { useNavigate } from 'react-router-dom';

type NavBarProps = {
  onLogout: () => void;
};

const NavBar: React.FC<NavBarProps> = ({ onLogout }) => {
  const navigate = useNavigate();

  return (
    <nav className="flex justify-between items-center bg-transparent text-gray-800 px-6 py-3 fixed top-0 left-0 w-full z-10">
      <div
        className="cursor-pointer flex items-center"
        onClick={() => navigate('/select')}
      >
        <img
          src="/images/logo.png"
          alt="ProT 로고"
          className="h-16 w-auto"
        />
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
