import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchChapterPages } from '../services/mangadexApi';
import SmartImage from '../components/SmartImage';
import { Loader2, Home, LogOut, ChevronLeft } from 'lucide-react';

const Reader = () => {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNavbar, setShowNavbar] = useState(true);

  useEffect(() => {
    const loadPages = async () => {
      setLoading(true);
      try {
        const imageUrls = await fetchChapterPages(chapterId);
        setPages(imageUrls);
      } catch (err) {
        console.error("Gagal memuat halaman:", err);
      } finally {
        setLoading(false);
      }
    };
    loadPages();
  }, [chapterId]);

  const toggleNav = () => setShowNavbar(!showNavbar);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <Loader2 className="animate-spin mb-4 text-blue-500" size={48} />
      <p className="animate-pulse text-gray-400">Optimizing images with Data Saver...</p>
    </div>
  );

  return (
    <div className="relative bg-zinc-950 min-h-screen">
      <nav className={`fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10 transition-transform duration-300 ${showNavbar ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              title="Back"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-sm font-bold truncate max-w-[150px] md:max-w-xs">
              Reading Mode
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate('/')} 
              className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-xl transition-colors text-sm font-medium"
            >
              <Home size={18} /> <span className="hidden md:block">Home</span>
            </button>
            
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl transition-all text-sm font-bold shadow-lg shadow-red-600/20"
            >
              <LogOut size={18} /> <span>Exit</span>
            </button>
          </div>
        </div>
      </nav>

      {/* 2. Content Area */}
      <div 
        className="max-w-3xl mx-auto pt-20 pb-10 flex flex-col gap-1 cursor-pointer"
        onClick={toggleNav}
      >
        {pages.map((url, index) => (
          <SmartImage 
            key={index}
            src={url}
            alt={`Page ${index + 1}`}
            containerClass="w-full min-h-[400px] bg-zinc-900"
            className="w-full h-auto object-contain"
          />
        ))}
      </div>
    </div>
  );
};

export default Reader;