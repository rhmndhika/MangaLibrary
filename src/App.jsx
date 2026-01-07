import React, { useState, useEffect } from "react";
import {
  Search,
  Heart,
  Book,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

const BASE_URL = "https://api.mangadex.org";

function App() {
  const [view, setView] = useState("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [selectedManga, setSelectedManga] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("mangadex-favorites");
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  }, []);

  const saveFavorites = (newFavorites) => {
    setFavorites(newFavorites);
    localStorage.setItem("mangadex-favorites", JSON.stringify(newFavorites));
  };

  const searchManga = async (query) => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${BASE_URL}/manga?title=${encodeURIComponent(
          query
        )}&limit=20&includes[]=cover_art&includes[]=author`
      );
      const data = await response.json();

      if (data.result === "ok") {
        setSearchResults(data.data);
      }
    } catch (err) {
      setError("Failed to search manga");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    searchManga(searchQuery);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const toggleFavorite = (manga) => {
    const isFavorited = favorites.some((fav) => fav.id === manga.id);

    if (isFavorited) {
      saveFavorites(favorites.filter((fav) => fav.id !== manga.id));
    } else {
      saveFavorites([...favorites, manga]);
    }
  };

  const isFavorited = (mangaId) => {
    return favorites.some((fav) => fav.id === mangaId);
  };

  const viewMangaDetail = async (manga) => {
    setSelectedManga(manga);
    setView("detail");
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${BASE_URL}/manga/${manga.id}/feed?translatedLanguage[]=en&order[chapter]=asc&limit=100`
      );
      const data = await response.json();

      if (data.result === "ok") {
        setChapters(data.data);
      }
    } catch (err) {
      setError("Failed to load chapters");
    } finally {
      setLoading(false);
    }
  };

  const viewChapter = async (chapter) => {
    setSelectedChapter(chapter);
    setView("reader");
    setCurrentPage(0);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_URL}/at-home/server/${chapter.id}`);
      const data = await response.json();

      if (data.result === "ok") {
        const baseUrl = data.baseUrl;
        const hash = data.chapter.hash;
        const pageFiles = data.chapter.data;

        const pageUrls = pageFiles.map(
          (file) => `${baseUrl}/data/${hash}/${file}`
        );
        setPages(pageUrls);
      }
    } catch (err) {
      setError("Failed to load chapter pages");
    } finally {
      setLoading(false);
    }
  };

  const getCoverUrl = (manga) => {
    const coverRel = manga.relationships.find(
      (rel) => rel.type === "cover_art"
    );
    if (coverRel && coverRel.attributes) {
      return `https://uploads.mangadex.org/covers/${manga.id}/${coverRel.attributes.fileName}`;
    }
    return null;
  };

  const getTitle = (manga) => {
    return (
      manga.attributes.title.en ||
      manga.attributes.title["ja-ro"] ||
      Object.values(manga.attributes.title)[0]
    );
  };

  const MangaCard = ({ manga, showFavorite = true }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 bg-gray-200">
        {getCoverUrl(manga) && (
          <img
            src={getCoverUrl(manga)}
            alt={getTitle(manga)}
            className="w-full h-full object-cover"
          />
        )}
        {showFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(manga);
            }}
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
          >
            <Heart
              className={`w-5 h-5 ${
                isFavorited(manga.id)
                  ? "fill-red-500 text-red-500"
                  : "text-gray-600"
              }`}
            />
          </button>
        )}
      </div>
      <div
        onClick={() => viewMangaDetail(manga)}
        className="p-4 cursor-pointer"
      >
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
          {getTitle(manga)}
        </h3>
        <p className="text-sm text-gray-600">
          {manga.attributes.status} • {manga.attributes.year || "N/A"}
        </p>
      </div>
    </div>
  );

  const SearchView = () => (
    <div>
      <div className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search manga..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
          >
            <Search className="w-5 h-5" />
            Search
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {searchResults.map((manga) => (
          <MangaCard key={manga.id} manga={manga} />
        ))}
      </div>

      {searchResults.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          Search for manga to get started
        </div>
      )}
    </div>
  );

  const FavoritesView = () => (
    <div>
      <h2 className="text-2xl font-bold mb-6">My Favorites</h2>

      {favorites.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>No favorites yet. Add some manga to your favorites!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {favorites.map((manga) => (
            <MangaCard key={manga.id} manga={manga} />
          ))}
        </div>
      )}
    </div>
  );

  const DetailView = () => (
    <div>
      <button
        onClick={() => setView("search")}
        className="flex items-center gap-2 mb-6 text-blue-500 hover:text-blue-600"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-48 h-64 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
            {getCoverUrl(selectedManga) && (
              <img
                src={getCoverUrl(selectedManga)}
                alt={getTitle(selectedManga)}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-3xl font-bold">{getTitle(selectedManga)}</h1>
              <button
                onClick={() => toggleFavorite(selectedManga)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <Heart
                  className={`w-6 h-6 ${
                    isFavorited(selectedManga.id)
                      ? "fill-red-500 text-red-500"
                      : "text-gray-600"
                  }`}
                />
              </button>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                {selectedManga.attributes.status}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                {selectedManga.attributes.year || "N/A"}
              </span>
              {selectedManga.attributes.publicationDemographic && (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                  {selectedManga.attributes.publicationDemographic}
                </span>
              )}
            </div>

            <p className="text-gray-700 mb-4">
              {selectedManga.attributes.description?.en ||
                Object.values(selectedManga.attributes.description || {})[0] ||
                "No description available"}
            </p>

            <div className="flex flex-wrap gap-2">
              {selectedManga.attributes.tags.slice(0, 10).map((tag) => (
                <span
                  key={tag.id}
                  className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-sm"
                >
                  {tag.attributes.name.en}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Chapters</h2>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-2">
          {chapters.map((chapter) => (
            <div
              key={chapter.id}
              onClick={() => viewChapter(chapter)}
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-200"
            >
              <div>
                <span className="font-semibold">
                  Chapter {chapter.attributes.chapter || "N/A"}
                </span>
                {chapter.attributes.title && (
                  <span className="text-gray-600 ml-2">
                    - {chapter.attributes.title}
                  </span>
                )}
              </div>
              <Book className="w-5 h-5 text-gray-400" />
            </div>
          ))}
        </div>

        {chapters.length === 0 && !loading && (
          <p className="text-center text-gray-500 py-8">
            No chapters available
          </p>
        )}
      </div>
    </div>
  );

  const ReaderView = () => (
    <div className="bg-black min-h-screen">
      <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
        <button
          onClick={() => {
            setView("detail");
            setSelectedChapter(null);
            setPages([]);
          }}
          className="flex items-center gap-2 hover:text-gray-300"
        >
          <X className="w-5 h-5" />
          Close Reader
        </button>

        <div className="text-center">
          <p className="font-semibold">{getTitle(selectedManga)}</p>
          <p className="text-sm text-gray-400">
            Chapter {selectedChapter.attributes.chapter || "N/A"}
            {selectedChapter.attributes.title &&
              ` - ${selectedChapter.attributes.title}`}
          </p>
        </div>

        <div className="text-sm">
          Page {currentPage + 1} of {pages.length}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-96">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded m-4">
          {error}
        </div>
      )}

      {!loading && pages.length > 0 && (
        <div className="flex items-center justify-center min-h-screen p-4">
          <img
            src={pages[currentPage]}
            alt={`Page ${currentPage + 1}`}
            className="max-w-full max-h-screen object-contain"
          />
        </div>
      )}

      {pages.length > 0 && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4">
          <button
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          <button
            onClick={() =>
              setCurrentPage(Math.min(pages.length - 1, currentPage + 1))
            }
            disabled={currentPage === pages.length - 1}
            className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {view !== "reader" && (
        <nav className="bg-white shadow-md mb-6">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <h1 className="text-2xl font-bold text-blue-500">
                MangaDex Reader
              </h1>

              <div className="flex gap-4">
                <button
                  onClick={() => setView("search")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    view === "search"
                      ? "bg-blue-500 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Search className="w-5 h-5" />
                  Search
                </button>

                <button
                  onClick={() => setView("favorites")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    view === "favorites"
                      ? "bg-blue-500 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Heart className="w-5 h-5" />
                  Favorites ({favorites.length})
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}

      {view !== "reader" && (
        <div className="max-w-7xl mx-auto px-4 pb-8">
          {view === "search" && <SearchView />}
          {view === "favorites" && <FavoritesView />}
          {view === "detail" && <DetailView />}
        </div>
      )}

      {view === "reader" && <ReaderView />}
    </div>
  );
}

export default App;
