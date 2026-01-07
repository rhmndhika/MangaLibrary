import React from 'react';
import { Heart } from 'lucide-react';
import { getCoverUrl } from '../services/mangadexApi';

const MangaCard = ({ manga, onSelect, isFavorite, onToggleFav }) => {
  const title = manga.attributes.title.en || Object.values(manga.attributes.title)[0];

  return (
    <div className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
      <div className="aspect-[3/4] overflow-hidden relative">
        <img 
          src={getCoverUrl(manga)} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          alt={title}
        />
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
        <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">
          {manga.attributes.status} • {manga.attributes.year || '2024'}
        </p>
      </div>
    </div>
  );
};

export default MangaCard;