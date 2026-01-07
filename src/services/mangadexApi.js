/**
 * MANGADEX API SERVICE - FULL VERSION (CORS BYPASS & VERCEL READY)
 */

const getBaseUrl = () => {
  if (typeof window === 'undefined') return 'https://api.mangadex.org';
  
  const isProd = window.location.hostname !== 'localhost';
  // Menggunakan domain origin + path proxy yang didaftarkan di vercel.json
  return isProd 
    ? `${window.location.origin}/api/mangadex` 
    : 'https://api.mangadex.org';
};

const BASE_URL = getBaseUrl();

/**
 * HELPER: Membangun query string yang benar.
 * Mencegah error [object Object] pada parameter nested seperti order.
 */
const buildQueryParams = (urlObj, params) => {
  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value === undefined || value === null) return;

    if (typeof value === 'object' && !Array.isArray(value)) {
      // Menangani order[chapter]=desc
      Object.keys(value).forEach(subKey => {
        urlObj.searchParams.append(`${key}[${subKey}]`, value[subKey]);
      });
    } else if (Array.isArray(value)) {
      // Menangani includes[]=cover_art
      value.forEach(val => {
        const cleanKey = key.includes('[]') ? key : `${key}[]`;
        urlObj.searchParams.append(cleanKey, val);
      });
    } else {
      urlObj.searchParams.append(key, value);
    }
  });
};

// --- CORE API FUNCTIONS ---

/**
 * 1. Fetch Genres / Tags
 */
export const fetchGenres = async () => {
  try {
    const res = await fetch(`${BASE_URL}/manga/tag`);
    if (!res.ok) throw new Error("Gagal mengambil tags");
    return await res.json();
  } catch (error) {
    console.error("Genre Fetch Error:", error);
    throw error;
  }
};

/**
 * 2. Fetch Manga List (Home, Search, & Filters)
 */
export const fetchManga = async (params = {}, options = {}) => {
  try {
    const url = new URL(`${BASE_URL}/manga`);
    const defaultParams = {
      limit: 15,
      offset: 0,
      'includes[]': ['cover_art', 'author', 'artist'],
      'contentRating[]': ['safe', 'suggestive'],
    };
    
    const finalParams = { ...defaultParams, ...params };
    
    if (!finalParams['order[latestUploadedChapter]'] && !params.order) {
      finalParams['order[latestUploadedChapter]'] = 'desc';
    }

    buildQueryParams(url, finalParams);

    const response = await fetch(url.toString(), {
      ...options,
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') return null;
    throw error;
  }
};

/**
 * 3. Fetch Latest Updates (Halaman Terbaru)
 */
export const fetchLatestUpdates = async (limit = 24, offset = 0) => {
  const url = new URL(`${BASE_URL}/manga`);
  const params = {
    limit,
    offset,
    'includes[]': ['cover_art', 'author'],
    'contentRating[]': ['safe', 'suggestive'],
    'order': { latestUploadedChapter: 'desc' }
  };
  buildQueryParams(url, params);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Gagal mengambil update terbaru");
  return res.json();
};

/**
 * 4. Fetch Detail Satu Manga
 */
export const fetchMangaDetail = async (id) => {
  const res = await fetch(`${BASE_URL}/manga/${id}?includes[]=artist&includes[]=author&includes[]=cover_art`);
  if (!res.ok) throw new Error("Gagal mengambil detail manga");
  return res.json();
};

/**
 * 5. Fetch Daftar Chapter (Feed)
 */
export const fetchMangaFeed = async (mangaId, offset = 0) => {
  const url = new URL(`${BASE_URL}/manga/${mangaId}/feed`);
  const params = {
    limit: 96,
    offset: offset,
    'includes[]': ['scanlation_group', 'user'],
    'order[volume]': 'desc',
    'order[chapter]': 'desc',
    'contentRating[]': ['safe', 'suggestive', 'erotica', 'pornographic'],
    'translatedLanguage[]': ['en'],
    includeUnavailable: 0,
  };
  buildQueryParams(url, params);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Gagal mengambil feed chapter");
  return res.json();
};

/**
 * 6. Fetch Chapter Pages (Untuk Reader)
 * Menggunakan dataSaver agar loading cepat.
 */
export const fetchChapterPages = async (chapterId) => {
  try {
    // Lewat Proxy agar bypass CORS
    const res = await fetch(`${BASE_URL}/at-home/server/${chapterId}`);
    if (!res.ok) throw new Error("Gagal mengambil data server gambar");
    
    const data = await res.json();
    const host = data.baseUrl;
    const { hash, dataSaver } = data.chapter; 
    
    // File gambar (.jpg) diizinkan akses langsung dari host MangaDex
    return dataSaver.map((file) => `${host}/data-saver/${hash}/${file}`);
  } catch (error) {
    console.error("Gagal memuat halaman chapter:", error);
    throw error;
  }
};

// --- HELPER FUNCTIONS ---

export const getTitle = (manga) => {
  if (!manga?.attributes?.title) return "Unknown Title";
  return manga.attributes.title.en || Object.values(manga.attributes.title)[0];
};

export const getCoverUrl = (manga) => {
  const coverRel = manga.relationships?.find(rel => rel.type === "cover_art");
  const fileName = coverRel?.attributes?.fileName;
  // Gunakan thumbnail 256px agar performa Vercel optimal
  return fileName ? `https://uploads.mangadex.org/covers/${manga.id}/${fileName}.256.jpg` : null;
};