import React from 'react';
import { Home as HomeIcon, Search, Library, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'HOME', icon: HomeIcon, path: '/' },
    { label: 'SEARCH', icon: Search, path: '/search' },
    { label: 'LIBRARY', icon: Library, path: '/library' },
  ];

  return (
    <>
      <nav className="hidden md:flex fixed top-0 w-full bg-white border-b z-50 px-6 py-3 justify-between items-center">
        <div className="font-black text-xl text-blue-600">MangaApp</div>
        <div className="flex gap-8">
          {navItems.map((item) => (
            <button 
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`font-bold text-sm ${location.pathname === item.path ? 'text-blue-600' : 'text-gray-400'}`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <User className="text-gray-400" />
      </nav>

      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-lg border-t z-50 pb-safe">
        <div className="flex justify-around items-end py-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center gap-1 transition-all"
              >
                <item.icon 
                  size={24} 
                  className={`${isActive ? 'text-blue-600' : 'text-gray-400'}`} 
                  strokeWidth={isActive ? 3 : 2}
                />
                <span className={`text-[10px] font-black ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                  {item.label}
                </span>
                {isActive && <div className="w-1 h-1 bg-blue-600 rounded-full mt-0.5" />}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default Navbar;