import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchManga } from '../services/mangadexApi'; // Pastikan helper ini tersedia
import SmartImage from '../components/SmartImage';
import { ChevronLeft, ChevronRight, Loader2, BookOpen } from 'lucide-react';

const LatestPage = () => {
  const [mangaList, setMangaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalManga, setTotalManga] = useState(0);
  const limit = 12; // Jumlah manga per halaman
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const offset = (currentPage - 1) * limit;
        const response = await fetchManga({
          limit: limit,
          offset: offset,
          'order[latestUploadedChapter]': 'desc', // Urutkan berdasarkan update terbaru
        });

        if (response && response.data) {
          setMangaList(response.data);
          setTotalManga(response.total || 0);
        }
      } catch (err) {
        console.error("Error fetching manga:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
    window.scrollTo(0, 0); // Scroll ke atas setiap ganti halaman
  }, [currentPage]);

  const totalPages = Math.ceil(totalManga / limit);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 bg-white shadow-sm hover:bg-gray-100 rounded-full transition-all">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Latest Updates</h1>
          <p className="text-sm text-gray-500 font-medium">Menampilkan {mangaList.length} manga terbaru</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      ) : (
        <>
          {/* Grid Manga */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {mangaList.map((manga) => {
              const title = manga.attributes.title.en || manga.attributes.title.ja || Object.values(manga.attributes.title)[0];
              const coverRel = manga.relationships.find(rel => rel.type === 'cover_art');
              const fileName = coverRel?.attributes?.fileName;
              const coverUrl = fileName 
                ? `https://uploads.mangadex.org/covers/${manga.id}/${fileName}.256.jpg`
                : `https://og.mangadex.org/og-image/manga/${manga.id}`;

              return (
                <div 
                  key={manga.id}
                  onClick={() => navigate(`/manga/${manga.id}`)}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all cursor-pointer group"
                >
                  <div className="aspect-[3/4] overflow-hidden bg-gray-200 relative">
                    <SmartImage 
                      src={coverUrl} 
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] text-white font-bold uppercase">
                      {manga.attributes.status}
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-gray-800 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors h-10">
                      {title}
                    </h3>
                    <div className="mt-2 flex items-center gap-2 text-gray-400 text-[10px] font-bold">
                      <BookOpen size={12} />
                      <span>{manga.attributes.year || 'N/A'}</span>
                      <span className="ml-auto uppercase text-blue-500">{manga.attributes.publicationDemographic || 'General'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="p-2 rounded-lg bg-white border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              
              <div className="flex gap-1">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  // Logika sederhana untuk menampilkan range halaman
                  let pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                  if (pageNum > totalPages) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                        currentPage === pageNum 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="p-2 rounded-lg bg-white border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LatestPage;