import React from 'react';
import { Home as HomeIcon, Search, Library, User, LogIn, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Sembunyikan Navbar di halaman tertentu agar tidak "kacau" atau tumpang tindih
  const hideNavbarPaths = ['/reader'];
  const shouldHideNavbar = hideNavbarPaths.some(path => location.pathname.startsWith(path));

  if (shouldHideNavbar) return null;

  // 2. Cek status login (MangaDex Official Auth)
  const isLoggedIn = !!localStorage.getItem('md_access_token');

  const handleLogout = () => {
    localStorage.removeItem('md_access_token');
    localStorage.removeItem('md_refresh_token');
    localStorage.removeItem('md_token_expires');
    navigate('/');
    window.location.reload();
  };

  const navItems = [
    { label: 'HOME', icon: HomeIcon, path: '/' },
    { label: 'SEARCH', icon: Search, path: '/search' },
    { label: 'LIBRARY', icon: Library, path: '/library' },
  ];

  return (
    <>
      {/* --- DESKTOP NAVBAR --- */}
      <nav className="hidden md:flex fixed top-0 left-0 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 z-[100] px-8 py-4 justify-between items-center shadow-sm">
        <div 
          className="font-black text-2xl text-blue-600 tracking-tighter cursor-pointer"
          onClick={() => navigate('/')}
        >
          Manga<span className="text-gray-900">App</span>
        </div>
        
        <div className="flex gap-10">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button 
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`font-black text-xs tracking-widest transition-all duration-300 hover:text-blue-600 ${
                  isActive ? 'text-blue-600 scale-110' : 'text-gray-400'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-full text-xs font-black hover:bg-red-600 hover:text-white transition-all"
            >
              <LogOut size={16} /> LOGOUT
            </button>
          ) : (
            <button 
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-full text-xs font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
            >
              <LogIn size={16} /> Login
            </button>
          )}
        </div>
      </nav>

      {/* Spacer agar konten tidak tertutup fixed navbar */}
      <div className="hidden md:block h-20"></div>

      {/* --- MOBILE NAVBAR (Bottom) --- */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl border-t border-gray-100 z-[100] pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center py-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center gap-1 min-w-[60px]"
              >
                <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-blue-50' : ''}`}>
                    <item.icon 
                      size={22} 
                      className={isActive ? 'text-blue-600' : 'text-gray-400'} 
                      strokeWidth={isActive ? 3 : 2}
                    />
                </div>
                <span className={`text-[9px] font-black tracking-tight ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
          
          {/* Tombol Profile/Login Mobile */}
          <button
            onClick={() => isLoggedIn ? handleLogout() : navigate('/login')}
            className="flex flex-col items-center gap-1 min-w-[60px]"
          >
            <div className={`p-1 rounded-xl transition-all ${location.pathname === '/login' ? 'bg-blue-50' : ''}`}>
                {isLoggedIn ? (
                  <LogOut size={22} className="text-red-500" />
                ) : (
                  <User size={22} className={location.pathname === '/login' ? 'text-blue-600' : 'text-gray-400'} />
                )}
            </div>
            <span className={`text-[9px] font-black tracking-tight ${isLoggedIn ? 'text-red-500' : 'text-gray-400'}`}>
              {isLoggedIn ? 'LOGOUT' : 'ACCOUNT'}
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default Navbar;