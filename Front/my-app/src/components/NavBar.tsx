import React from 'react';

type NavBarProps = {
  onLogout: () => void;
};

const NavBar: React.FC<NavBarProps> = ({ onLogout }) => {
  return (
    <nav className="flex justify-between items-center bg-sky-300 text-white px-6 py-3 shadow-md fixed top-0 left-0 w-full z-10">
      <div className="text-2xl font-bold">😎권나박진</div>
      <button onClick={onLogout} className="hover:underline">
        LOGOUT
      </button>
    </nav>
  );
};

export default NavBar;
