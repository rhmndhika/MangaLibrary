import React, { useState, useEffect } from 'react';
import { fetchMangaFeed } from '../services/mangadexApi';
import { BookOpen, ExternalLink, Loader2, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ChapterList = ({ mangaId }) => {
  const navigate = useNavigate();
  const [allChapters, setAllChapters] = useState([]); // Data asli dari API
  const [filteredChapters, setFilteredChapters] = useState([]); // Data setelah filter & deduplikasi
  const [languages, setLanguages] = useState([]); // List bahasa yang tersedia
  const [selectedLang, setSelectedLang] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!mangaId) return;
      setLoading(true);
      try {
        const response = await fetchMangaFeed(mangaId);
        const data = response.data || [];
        setAllChapters(data);

        // Ambil daftar bahasa unik dari data yang masuk
        const availableLangs = [...new Set(data.map(ch => ch.attributes.translatedLanguage))];
        setLanguages(availableLangs);

        // Set default bahasa ke 'en' jika ada, jika tidak ambil yang pertama
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

  // Efek untuk memproses filter bahasa dan deduplikasi
  useEffect(() => {
    if (allChapters.length === 0) return;

    // 1. Filter berdasarkan bahasa yang dipilih
    const langFiltered = allChapters.filter(ch => ch.attributes.translatedLanguage === selectedLang);

    // 2. Deduplikasi: Jika nomor chapter sama, ambil yang teratas (terbaru)
    const unique = [];
    const seen = new Set();

    langFiltered.forEach(item => {
      const chNum = item.attributes.chapter;
      if (!seen.has(chNum)) {
        unique.push(item);
        seen.add(chNum);
      }
    });

    setFilteredChapters(unique);
  }, [selectedLang, allChapters]);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mt-8">
      {/* Tab Bahasa */}
      <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex items-center gap-3 overflow-x-auto no-scrollbar">
        <Globe size={16} className="text-gray-400 flex-shrink-0" />
        <div className="flex gap-2">
          {languages.sort().map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLang(lang)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase transition-all whitespace-nowrap ${
                selectedLang === lang
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
                  : 'bg-white text-gray-400 border border-gray-200 hover:border-blue-300 hover:text-blue-500'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* List Content */}
      <div className="max-h-[600px] overflow-y-auto">
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        ) : filteredChapters.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {filteredChapters.map((ch) => {
              const isExternal = ch.attributes.externalUrl !== null;
              return (
                <div
                  key={ch.id}
                  onClick={() => !isExternal && navigate(`/reader/${ch.id}`)}
                  className={`flex items-center justify-between p-4 transition-colors ${
                    isExternal ? 'bg-gray-50/30' : 'hover:bg-blue-50/30 cursor-pointer group'
                  }`}
                >
                  <div>
                    <div className="font-bold text-gray-800 group-hover:text-blue-600">
                      Chapter {ch.attributes.chapter || '0'}
                    </div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase mt-0.5 tracking-tight">
                      {ch.relationships.find(r => r.type === 'scanlation_group')?.attributes?.name || 'No Group'}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {isExternal ? (
                      <a
                        href={ch.attributes.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[10px] font-black bg-orange-50 text-orange-500 px-2 py-1 rounded border border-orange-100"
                      >
                        EXT <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-3 py-1 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all uppercase">
                        Read
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center text-gray-400 text-sm italic">
            No chapters available for this language.
          </div>
        )}
      </div>
    </div>
  );
};

export default ChapterList;