import React, { useState, useEffect, useMemo } from 'react';
import { fetchMangaFeed } from '../services/mangadexApi';
import { ExternalLink, Loader2, Globe, ChevronDown, ChevronUp, Book } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ChapterList = ({ mangaId }) => {
  const navigate = useNavigate();
  const [allChapters, setAllChapters] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [selectedLang, setSelectedLang] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedVolumes, setExpandedVolumes] = useState({});
  const [readingHistory, setReadingHistory] = useState({});

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('reading-history') || '{}');
    setReadingHistory(history);

    const loadData = async () => {
      if (!mangaId) return;
      setLoading(true);
      try {
        const response = await fetchMangaFeed(mangaId);
        const data = response.data || [];
        setAllChapters(data);

        const availableLangs = [...new Set(data.map(ch => ch.attributes.translatedLanguage))];
        setLanguages(availableLangs);

        if (availableLangs.includes('en')) {
          setSelectedLang('en');
        } else if (availableLangs.length > 0) {
          setSelectedLang(availableLangs[0]);
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [mangaId]);

  const groupedVolumes = useMemo(() => {
    const filtered = allChapters.filter(ch => ch.attributes.translatedLanguage === selectedLang);
    const groups = filtered.reduce((acc, ch) => {
      const vol = ch.attributes.volume || "No Volume";
      if (!acc[vol]) acc[vol] = [];
      acc[vol].push(ch);
      return acc;
    }, {});

    return Object.keys(groups)
      .sort((a, b) => {
        if (a === "No Volume") return 1;
        if (b === "No Volume") return -1;
        return parseFloat(b) - parseFloat(a);
      })
      .map(key => ({
        volume: key,
        chapters: groups[key].sort((a, b) => 
          parseFloat(b.attributes.chapter) - parseFloat(a.attributes.chapter)
        )
      }));
  }, [allChapters, selectedLang]);

  const toggleVolume = (vol) => {
    setExpandedVolumes(prev => ({ ...prev, [vol]: !prev[vol] }));
  };

  return (
    /* PERBAIKAN 1: Tambahkan margin-top yang cukup (mt-20) agar tidak tertutup Navbar 
       dan hapus overflow-hidden agar scroll halaman berfungsi */
    <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 mt-20 mb-10 mx-auto max-w-4xl">
      
      {/* Header - Tetap Sticky agar saat scroll user tahu ini list chapter */}
      <div className="sticky top-16 z-20 p-5 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between rounded-t-[32px]">
        <div className="flex items-center gap-2 text-gray-800 font-black text-sm uppercase tracking-wider">
          < Book size={18} className="text-blue-600" />
          <span>Chapter List</span>
        </div>
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
          <Globe size={14} className="text-gray-400" />
          <select 
            value={selectedLang} 
            onChange={(e) => setSelectedLang(e.target.value)}
            className="bg-transparent text-xs font-bold text-blue-600 outline-none cursor-pointer uppercase"
          >
            {languages.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
      </div>

      {/* PERBAIKAN 2: Hapus max-h-[700px] dan overflow-y-auto 
          Biarkan kontainer memanjang mengikuti konten agar scroll mengikuti halaman utama */}
      <div className="min-h-[300px]">
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        ) : groupedVolumes.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {groupedVolumes.map(({ volume, chapters }) => {
              const isCollapsed = expandedVolumes[volume];
              return (
                <div key={volume} className="group/vol">
                  {/* Volume Header */}
                  <div 
                    onClick={() => toggleVolume(volume)}
                    className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xs shadow-sm shadow-blue-100">
                        {volume === "No Volume" ? "?" : volume}
                      </div>
                      <div>
                        <h4 className="font-black text-gray-900 text-sm uppercase tracking-tight">
                          {volume === "No Volume" ? "Miscellaneous" : `Volume ${volume}`}
                        </h4>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{chapters.length} Chapters</p>
                      </div>
                    </div>
                    <div className="text-gray-300 group-hover/vol:text-blue-500 transition-colors">
                        {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                    </div>
                  </div>

                  {/* Chapter Items */}
                  {!isCollapsed && (
                    <div className="bg-white">
                      {chapters.map((ch) => {
                        const isExternal = ch.attributes.externalUrl !== null;
                        const lastReadData = readingHistory[mangaId];
                        const isLastRead = lastReadData && lastReadData.chapterId === ch.id;

                        return (
                          <div
                            key={ch.id}
                            onClick={() => !isExternal && navigate(`/reader/${ch.id}`, { 
                              state: { mangaId, chapterNum: ch.attributes.chapter, allChapters: chapters } 
                            })}
                            className={`group flex items-center justify-between py-4 px-8 border-l-4 transition-all cursor-pointer ${
                              isLastRead 
                                ? 'bg-blue-50/50 border-blue-600' 
                                : 'border-transparent hover:border-blue-200 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`font-bold text-sm ${isLastRead ? 'text-blue-600' : 'text-gray-700'}`}>
                                  Chapter {ch.attributes.chapter || '0'}
                                </span>
                                {isLastRead && (
                                  <span className="text-[9px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-tighter flex items-center gap-1 shadow-sm shadow-blue-200">
                                    <span className="w-1 h-1 bg-white rounded-full animate-pulse"></span>
                                    Latest Read
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-gray-400 truncate max-w-[250px] font-medium mt-0.5">
                                {ch.attributes.title || 'No Title'}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                {isExternal ? (
                                    <ExternalLink size={14} className="text-gray-300" />
                                ) : (
                                    <div className={`text-[10px] font-black px-4 py-1.5 rounded-xl transition-all ${
                                        isLastRead 
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                                        : 'bg-gray-100 text-gray-400 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-md group-hover:shadow-blue-200'
                                    }`}>
                                        {isLastRead ? 'CONTINUE' : 'READ'}
                                    </div>
                                )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center text-gray-400 text-sm italic">No chapters found.</div>
        )}
      </div>
    </div>
  );
};

export default ChapterList;