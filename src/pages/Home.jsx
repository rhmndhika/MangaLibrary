import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchManga, fetchGenres } from '../services/mangadexApi';
import MangaCard from '../components/MangaCard';
import { Loader2, Sparkles, Zap, Flame } from 'lucide-react';
import LatestUpdates from '../components/LatestUpdate';
import { ArrowRight } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  
  // State Storage
  const [genres, setGenres] = useState([]);
  const [latest, setLatest] = useState([]);
  const [byGenre, setByGenre] = useState([]);
  
  // State UI
  const [activeGenre, setActiveGenre] = useState(null);
  const [loading, setLoading] = useState(true);
  const [genreLoading, setGenreLoading] = useState(false);

  // 1. Fetch Genre/Tags dari API saat pertama kali load
  useEffect(() => {
    const fetchTags = async () => {
    try {
        const json = await fetchGenres(); 
        
        const genreTags = json.data
        .filter(tag => tag.attributes.group === 'genre')
        .map(tag => ({
            id: tag.id,
            name: tag.attributes.name.en
        }));

        setGenres(genreTags);
        if (genreTags.length > 0) setActiveGenre(genreTags[0]);
    } catch (err) {
        console.error("Gagal mengambil tags:", err);
    }
    };

    const fetchLatest = async () => {
      try {
        const data = await fetchManga({ 
          order: { updatedAt: 'desc' }, 
          limit: 12 
        });
        setLatest(data.data || []);
      } catch (err) {
        console.error("Gagal mengambil manga terbaru:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
    fetchLatest();
  }, []);

  useEffect(() => {
    if (!activeGenre) return;

    const loadByGenre = async () => {
      setGenreLoading(true);
      try {
        const data = await fetchManga({ 
          'includedTags[]': [activeGenre.id],
          limit: 12 
        });
        setByGenre(data.data || []);
      } catch (err) {
        console.error("Gagal mengambil manga genre:", err);
      } finally {
        setGenreLoading(false);
      }
    };

    loadByGenre();
  }, [activeGenre]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="mt-4 text-gray-500 font-medium">Fetching Manga Content...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20 px-4 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 md:p-16 text-white shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
            The Ultimate <br /> Manga Experience.
          </h1>
          <button 
            onClick={() => navigate('/search')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/30"
          >
            Start Reading
          </button>
        </div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]"></div>
      </section>

      {/* Newest Section */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
              <Flame size={24} fill="currentColor" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-800">Latest Updates</h2>
          </div>
          
          <button 
            onClick={() => navigate('/latest')} 
            className="group flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-white transition-all bg-blue-50 px-5 py-2.5 rounded-full hover:bg-blue-600 shadow-sm border border-blue-100"
          >
            See All 
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        
        <LatestUpdates />
      </section>

      {/* Dynamic Genre Section */}
      <section>
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
            <Sparkles size={24} fill="currentColor" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-800">Browse Categories</h2>
        </div>

        {/* Dynamic Genre Filter Bar */}
        <div className="flex gap-3 overflow-x-auto pb-6 no-scrollbar">
          {genres.map((genre) => (
            <button
              key={genre.id}
              onClick={() => setActiveGenre(genre)}
              className={`px-6 py-3 rounded-2xl whitespace-nowrap font-bold transition-all duration-300 border ${
                activeGenre?.id === genre.id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-600/20 scale-105'
                  : 'bg-white text-gray-500 border-gray-100 hover:border-blue-300'
              }`}
            >
              {genre.name}
            </button>
          ))}
        </div>

        {/* Genre Content Grid */}
        {genreLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 opacity-50">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-gray-200 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 transition-all duration-500">
            {byGenre.map(m => (
              <MangaCard 
                key={m.id} 
                manga={m} 
                onSelect={(manga) => navigate(`/manga/${manga.id}`)} 
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;