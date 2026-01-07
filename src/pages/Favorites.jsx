import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartOff } from 'lucide-react';
import MangaCard from '../components/MangaCard';

const Favorites = () => {
  const [favs, setFavs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("mangadex-favorites") || "[]");
    setFavs(saved);
  }, []);

  if (favs.length === 0) {
    return (
      <div className="text-center py-40">
        <HeartOff size={80} className="mx-auto text-gray-200 mb-4" />
        <h2 className="text-2xl font-bold text-gray-400">Belum ada favorit</h2>
        <button onClick={() => navigate('/')} className="mt-4 text-blue-600 font-semibold">Cari Manga Sekarang</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold mb-8">Koleksi Favorit</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {favs.map(m => (
          <MangaCard key={m.id} manga={m} onSelect={(m) => navigate(`/manga/${m.id}`)} />
        ))}
      </div>
    </div>
  );
};

export default Favorites;