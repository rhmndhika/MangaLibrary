import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchManga } from '../services/mangadexApi';
import MangaCard from '../components/MangaCard';
import { Loader2, Search as SearchIcon, X } from 'lucide-react';

const Search = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Mengambil parameter dari URL (?tagId=...&tagName=...)
  const queryParams = new URLSearchParams(location.search);
  const tagIdFromUrl = queryParams.get('tagId');
  const tagNameFromUrl = queryParams.get('tagName');

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fungsi untuk membersihkan semua filter dan hasil
  const clearFilters = () => {
    setResults([]); // Menghilangkan hasil search dari layar
    setSearchTerm(''); // Mengosongkan kolom input
    navigate('/search', { replace: true }); // Membersihkan URL
  };

  // Definisi fungsi untuk load manga berdasarkan Tag ID
  const loadMangaByTag = async (tagId) => {
    setLoading(true);
    try {
      const data = await fetchManga({
        'includedTags[]': [tagId], // Mengirim tagId ke API
        limit: 24,
        'includes[]': ['cover_art']
      });
      setResults(data.data || []);
    } catch (err) {
      console.error("Gagal memuat manga berdasarkan tag:", err);
    } finally {
      setLoading(false);
    }
  };

  // Menjalankan pencarian otomatis jika ada tagId di URL
  useEffect(() => {
    if (tagIdFromUrl) {
      loadMangaByTag(tagIdFromUrl);
    }
  }, [tagIdFromUrl]);

  // Fungsi pencarian manual lewat input teks
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchTerm) return;
    setLoading(true);
    try {
      const data = await fetchManga({ 
        title: searchTerm, 
        limit: 24,
        'includes[]': ['cover_art']
      });
      setResults(data.data || []);
      // Jika mencari manual, hapus parameter tag dari URL agar tidak membingungkan
      if (tagIdFromUrl) navigate('/search', { replace: true });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen bg-white">
      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="relative mb-8 max-w-2xl mx-auto">
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari judul manga..."
          className="w-full p-4 pl-12 pr-12 rounded-2xl border border-gray-100 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 transition-all"
        />
        <SearchIcon className="absolute left-4 top-4 text-gray-400" size={22} />
        
        {/* Tombol X untuk membersihkan input */}
        {searchTerm && (
          <button 
            type="button"
            onClick={clearFilters}
            className="absolute right-4 top-4 text-gray-400 hover:text-red-500 transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </form>

      {/* Label Indikator Filter Tag */}
      {tagNameFromUrl && (
        <div className="mb-8 flex items-center justify-between bg-blue-50 p-4 rounded-2xl border border-blue-100">
          <div className="flex items-center gap-2">
            <span className="text-blue-800 text-sm font-medium">Menampilkan Kategori:</span>
            <span className="px-4 py-1.5 bg-blue-600 text-white text-xs font-black rounded-full uppercase tracking-wider shadow-md">
              {tagNameFromUrl}
            </span>
          </div>
          <button 
            onClick={clearFilters} // Aksi hapus filter
            className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-white hover:bg-blue-600 bg-white px-4 py-2 rounded-xl shadow-sm transition-all border border-blue-100"
          >
            HAPUS FILTER
          </button>
        </div>
      )}

      {/* Konten Utama: Loading, Hasil, atau Kosong */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
          <p className="text-gray-500 font-medium animate-pulse">Mencari manga terbaik untukmu...</p>
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 transition-all">
          {results.map((manga) => (
            <MangaCard 
              key={manga.id} 
              manga={manga} 
              onSelect={(m) => navigate(`/manga/${m.id}`)} 
            />
          ))}
        </div>
      ) : (
        /* Tampilan saat tidak ada hasil atau filter dihapus */
        <div className="py-32 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-50 rounded-full mb-6">
            <SearchIcon size={40} className="text-gray-200" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {searchTerm || tagIdFromUrl ? "Tidak ada hasil ditemukan" : "Mulai Menjelajah"}
          </h3>
          <p className="text-gray-400 max-w-xs mx-auto text-sm leading-relaxed">
            {searchTerm || tagIdFromUrl 
              ? "Coba gunakan kata kunci lain atau hapus filter untuk melihat semua koleksi." 
              : "Gunakan kolom pencarian di atas atau pilih genre dari halaman detail manga."}
          </p>
        </div>
      )}
    </div>
  );
};

export default Search;