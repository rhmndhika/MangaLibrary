import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, User } from 'lucide-react';
import { fetchMangaDetail, getCoverUrl, getTitle } from '../services/mangadexApi';
import ChapterList from '../components/ChapterList';

const Detail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [manga, setManga] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadManga = async () => {
      try {
        const data = await fetchMangaDetail(id);
        setManga(data.data);
      } catch (err) {
        console.error("Gagal load detail manga:", err);
      } finally {
        setLoading(false);
      }
    };
    loadManga();
  }, [id]);

  // UPDATE: Fungsi untuk menangani klik pada tag
  const handleTagClick = (tagId, tagName) => {
    // Navigasi ke halaman search dengan parameter tagId dan tagName
    navigate(`/search?tagId=${tagId}&tagName=${tagName}`);
  };

  if (loading) return <div className="p-20 text-center text-blue-500 font-bold italic">Loading Manga...</div>;
  if (!manga) return <div className="p-20 text-center">Manga not found.</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-6 text-gray-600 hover:text-blue-600 transition-colors font-bold text-sm">
        <ArrowLeft size={20} /> BACK
      </button>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <div className="w-full md:w-80 flex-shrink-0">
          <img 
            src={getCoverUrl(manga)} 
            alt="cover" 
            className="w-full rounded-2xl shadow-2xl border-4 border-white"
          />
        </div>
        
        <div className="flex-1">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{getTitle(manga)}</h1>
          
          <div className="flex flex-wrap gap-4 mb-6">
            <span className="flex items-center gap-1 text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-full capitalize font-bold">
              <Clock size={14} /> {manga.attributes.status}
            </span>
            <span className="flex items-center gap-1 text-sm bg-orange-50 text-orange-600 px-3 py-1 rounded-full font-bold">
              <User size={14} /> {manga.relationships.find(r => r.type === 'author')?.attributes?.name || 'Unknown Author'}
            </span>
          </div>

          <h3 className="text-lg font-bold mb-2 text-gray-800">Description</h3>
          <p className="text-gray-600 leading-relaxed line-clamp-6 hover:line-clamp-none transition-all duration-500 text-sm">
            {manga.attributes.description.en || "No description available."}
          </p>
          
          {/* UPDATE: Tags sekarang bisa diklik */}
          <div className="flex flex-wrap gap-2 mt-6">
            {manga.attributes.tags.map(tag => (
              <button 
                key={tag.id} 
                onClick={() => handleTagClick(tag.id, tag.attributes.name.en)}
                className="text-[10px] font-bold bg-gray-100 text-gray-500 px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-all uppercase tracking-wider shadow-sm"
              >
                {tag.attributes.name.en}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chapter List Section */}
      {/* Menggunakan manga.id dan mengirim data tambahan yang diperlukan */}
      <ChapterList 
        mangaId={manga.id} 
      />
    </div>
  );
};

export default Detail;