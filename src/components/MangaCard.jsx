import React, { useState, useEffect } from 'react';
import { Heart, BookOpen } from 'lucide-react';
import { getCoverUrl } from '../services/mangadexApi';

const MangaCard = ({ manga, onSelect, isFavorite, onToggleFav }) => {
  const title = manga.attributes.title.en || Object.values(manga.attributes.title)[0];
  const [history, setHistory] = useState(null);

  useEffect(() => {
    // Cek apakah manga ini ada di history
    const savedHistory = JSON.parse(localStorage.getItem('reading-history') || '{}');
    if (savedHistory[manga.id]) {
      setHistory(savedHistory[manga.id]);
    }
  }, [manga.id]);

  return (
    <div className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
      <div className="aspect-[3/4] overflow-hidden relative">
        <img 
          src={getCoverUrl(manga)} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          alt={title}
        />
        
        {/* Label Continue Reading */}
        {history && (
          <div className="absolute bottom-2 left-2 right-2 bg-blue-600/90 backdrop-blur-sm text-white px-2 py-1.5 rounded-lg flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-bottom-2">
            <BookOpen size={12} className="shrink-0" />
            <span className="text-[10px] font-black uppercase truncate">
              Lanjut Ch. {history.chapterNum}
            </span>
          </div>
        )}

        <button 
          onClick={(e) => { e.stopPropagation(); onToggleFav(manga); }}
          className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-md rounded-full shadow-lg"
        >
          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
        </button>
      </div>
      
      <div className="p-3 cursor-pointer" onClick={() => onSelect(manga)}>
        <h3 className="font-bold text-gray-800 line-clamp-1 text-sm md:text-base group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">
          {manga.attributes.status || 'Ongoing'}
        </p>
      </div>
    </div>
  );
};

export default MangaCard;