import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { fetchChapterPages, fetchMangaChapters } from '../services/mangadexApi';
import SmartImage from '../components/SmartImage';
import { Loader2, Home, LogOut, ChevronLeft, ChevronRight, List, ChevronDown, Check } from 'lucide-react';

const Reader = () => {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  
  const mangaId = location.state?.mangaId;
  const [pages, setPages] = useState([]);
  const [allChapters, setAllChapters] = useState(location.state?.allChapters || []);
  const [loading, setLoading] = useState(true);
  const [showNavbar, setShowNavbar] = useState(true);
  const [chapterNum, setChapterNum] = useState(location.state?.chapterNum);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const imageUrls = await fetchChapterPages(chapterId);
        setPages(imageUrls);

        let currentChapters = allChapters;
        if (allChapters.length === 0 && mangaId) {
          const fetchedChapters = await fetchMangaChapters(mangaId, 'en');
          setAllChapters(fetchedChapters);
          currentChapters = fetchedChapters;
        }

        if (currentChapters.length > 0) {
          const current = currentChapters.find(ch => ch.id === chapterId);
          if (current) setChapterNum(current.attributes.chapter);
        }
      } catch (err) {
        console.error("Reader Error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
    window.scrollTo(0, 0);
  }, [chapterId, mangaId]);

  const sortedChapters = useMemo(() => {
    return [...allChapters].sort((a, b) => 
      parseFloat(b.attributes.chapter) - parseFloat(a.attributes.chapter)
    );
  }, [allChapters]);

  const currentIndex = sortedChapters.findIndex(ch => ch.id === chapterId);
  const nextChapter = currentIndex > 0 ? sortedChapters[currentIndex - 1] : null;
  const prevChapter = currentIndex < sortedChapters.length - 1 && currentIndex !== -1 ? sortedChapters[currentIndex + 1] : null;

  const handleChapterChange = (ch) => {
    setIsDropdownOpen(false);
    navigate(`/reader/${ch.id}`, { 
      state: { mangaId, chapterNum: ch.attributes.chapter, allChapters: sortedChapters } 
    });
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
    </div>
  );

  return (
    <div className="bg-black min-h-screen select-none relative">
      {/* --- NAVBAR --- */}
      <nav className={`fixed top-0 left-0 w-full bg-black/95 backdrop-blur-md border-b border-white/10 z-[1000] transition-transform duration-300 ${
        showNavbar ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full">
              <ChevronLeft size={24} />
            </button>
            
            {/* CUSTOM DROPDOWN */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsDropdownOpen(!isDropdownOpen); }}
                className="flex items-center gap-2 bg-zinc-800/80 hover:bg-zinc-700 px-4 py-2 rounded-xl border border-white/5 transition-colors"
              >
                <List size={16} className="text-blue-500" />
                <span className="text-sm font-bold">Ch. {chapterNum}</span>
                <ChevronDown size={14} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* DROPDOWN MENU */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 max-h-[60vh] overflow-y-auto bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl z-[1001] backdrop-blur-xl animate-in fade-in zoom-in duration-200 scrollbar-hide">
                  <div className="p-2">
                    {sortedChapters.map((ch) => (
                      <button
                        key={ch.id}
                        onClick={() => handleChapterChange(ch)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all ${
                          ch.id === chapterId 
                            ? 'bg-blue-600/20 text-blue-400 font-bold' 
                            : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <span>Chapter {ch.attributes.chapter}</span>
                        {ch.id === chapterId && <Check size={14} />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => navigate('/')} className="p-2.5 hover:bg-white/10 rounded-xl text-zinc-400"><Home size={22}/></button>
          </div>
        </div>
      </nav>

      {/* AREA BACA */}
      <div 
        className={`max-w-3xl mx-auto flex flex-col gap-1 transition-all duration-300 ${showNavbar ? 'pt-16' : 'pt-0'}`}
        onClick={() => setShowNavbar(!showNavbar)}
      >
        {pages.map((url, index) => (
          <SmartImage key={index} src={url} alt={`P${index}`} containerClass="bg-zinc-900 min-h-[500px]" />
        ))}

        {/* BOTTOM NAV */}
        <div className="mt-10 mb-20 px-4 flex justify-between items-center bg-zinc-900/40 backdrop-blur-md p-6 rounded-3xl border border-white/5 mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <button 
            disabled={!prevChapter}
            onClick={() => handleChapterChange(prevChapter)}
            className={`group flex flex-col items-center gap-1 transition-all ${!prevChapter ? 'opacity-20' : 'hover:-translate-x-1'}`}
          >
            <div className={`p-4 rounded-full ${prevChapter ? 'bg-zinc-800 text-white' : 'bg-zinc-900 text-zinc-700'}`}>
              <ChevronLeft size={24}/>
            </div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase">Previous</span>
          </button>

          <div className="text-center">
            <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest mb-1">Now Reading</p>
            <p className="text-white font-black text-xl italic">CH. {chapterNum}</p>
          </div>

          <button 
            disabled={!nextChapter}
            onClick={() => handleChapterChange(nextChapter)}
            className={`group flex flex-col items-center gap-1 transition-all ${!nextChapter ? 'opacity-20' : 'hover:translate-x-1'}`}
          >
            <div className={`p-4 rounded-full ${nextChapter ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-zinc-900 text-zinc-700'}`}>
              <ChevronRight size={24}/>
            </div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase">Next Chapter</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reader;