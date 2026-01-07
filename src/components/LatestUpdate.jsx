import React, { useEffect, useState } from 'react';
import { fetchLatestUpdates } from '../services/mangadexApi';
import { useNavigate } from 'react-router-dom';
import { Clock, User, BookOpen } from 'lucide-react';

const LatestUpdates = () => {
  const [mangaList, setMangaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getUpdates = async () => {
      try {
        const data = await fetchLatestUpdates(24);
        setMangaList(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    getUpdates();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="h-28 bg-gray-100 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {mangaList.map((manga) => {
        const title = manga.attributes.title.en || manga.attributes.title.ja || manga.attributes.title['ja-ro'] || "Untitled";
        const coverArt = manga.relationships.find(r => r.type === 'cover_art');
        const fileName = coverArt?.attributes?.fileName;
        const coverUrl = fileName 
          ? `https://uploads.mangadex.org/covers/${manga.id}/${fileName}.256.jpg`
          : 'https://via.placeholder.com/256x400?text=No+Cover';

        return (
          <div 
            key={manga.id} 
            onClick={() => navigate(`/manga/${manga.id}`)}
            className="flex gap-4 cursor-pointer group bg-white border border-gray-100 p-3 rounded-2xl hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-200 transition-all duration-300"
          >
            {/* Cover Image */}
            <div className="relative w-20 h-28 flex-shrink-0 overflow-hidden rounded-xl shadow-sm">
              <img 
                src={coverUrl} 
                alt={title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
            </div>

            {/* Content Details */}
            <div className="flex flex-col justify-between py-1 flex-1 min-w-0">
              <div>
                <h3 className="text-[15px] font-bold text-gray-800 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                  {title}
                </h3>
                
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-black rounded uppercase tracking-wider border border-red-100">
                    Ch. {manga.attributes.lastChapter || 'New'}
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium">• 15 mins ago</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2 border-t border-gray-50 pt-2">
                <div className="flex items-center gap-1 text-orange-500">
                   <Clock size={11} />
                   <span className="text-[10px] font-bold uppercase">Hot</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LatestUpdates;