/**
 * MANGADEX API SERVICE (VERCEL COMPATIBLE)
 */

// Menentukan Base URL yang absolut untuk mencegah error "Invalid URL" di Vercel
const getBaseUrl = () => {
  if (typeof window === 'undefined') return 'https://api.mangadex.org';
  
  const isProd = window.location.hostname !== 'localhost';
  // Di Vercel (Production), request diarahkan ke proxy /api/mangadex yang ada di vercel.json
  // window.location.origin memastikan URL menjadi absolut (https://domain-anda.vercel.app/...)
  return isProd 
    ? `${window.location.origin}/api/mangadex` 
    : 'https://api.mangadex.org';
};

const BASE_URL = getBaseUrl();

// Helper: Serialisasi parameter untuk menangani Array dan Objek bersarang (seperti order[key])
// Ini mencegah munculnya [object Object] di URL
const buildQueryParams = (urlObj, params) => {
  Object.keys(params).forEach(key => {
    const value = params[key];

    if (value === undefined || value === null) return;

    // Menangani Nested Object (contoh: order: { updatedAt: 'desc' })
    if (typeof value === 'object' && !Array.isArray(value)) {
      Object.keys(value).forEach(subKey => {
        urlObj.searchParams.append(`${key}[${subKey}]`, value[subKey]);
      });
    } 
    // Menangani Array (contoh: includes: ['cover_art', 'author'])
    else if (Array.isArray(value)) {
      value.forEach(val => {
        const cleanKey = key.includes('[]') ? key : `${key}[]`;
        urlObj.searchParams.append(cleanKey, val);
      });
    } 
    // Menangani nilai standar (string/number)
    else {
      urlObj.searchParams.append(key, value);
    }
  });
};

// 1. Fetch Daftar Manga (Pencarian, Genre, Home)
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

    // Default sorting jika tidak ditentukan
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
    console.error("MangaDex API Error:", error);
    throw error;
  }
};

// 2. Fetch Manga Terbaru (Latest Updates)
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
  if (!res.ok) throw new Error("Gagal mengambil data terbaru");
  return res.json();
};

// 3. Fetch Detail Satu Manga
export const fetchMangaDetail = async (id) => {
  const res = await fetch(`${BASE_URL}/manga/${id}?includes[]=artist&includes[]=author&includes[]=cover_art`);
  return res.json();
};

// 4. Fetch Feed Chapter (Daftar Chapter)
export const fetchMangaFeed = async (mangaId, offset = 0) => {
  const url = new URL(`${BASE_URL}/manga/${mangaId}/feed`);
  const params = {
    limit: 96,
    offset: offset,
    'includes[]': ['scanlation_group', 'user'],
    'order[volume]': 'desc',
    'order[chapter]': 'desc',
    'contentRating[]': ['safe', 'suggestive', 'erotica', 'pornographic'],
    'translatedLanguage[]': ['en'], // Hapus baris ini jika ingin semua bahasa
    includeUnavailable: 0,
  };

  buildQueryParams(url, params);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Gagal mengambil feed chapter");
  return res.json();
};

// 5. Fetch Gambar untuk Reader (Gunakan Data Saver agar Ringan)
export const fetchChapterImages = async (chapterId) => {
  try {
    // GUNAKAN BASE_URL (relatif/proxy), JANGAN URL mangadex langsung
    const res = await fetch(`${BASE_URL}/at-home/server/${chapterId}`);
    
    if (!res.ok) throw new Error("Gagal mengambil data server gambar");
    
    const data = await res.json();
    const host = data.baseUrl;
    const { hash, dataSaver } = data.chapter; 
    
    // URL gambar (host) biasanya berbeda domain, tetapi MangaDex membolehkan 
    // akses langsung untuk file gambar (.jpg/.png), jadi ini aman.
    return dataSaver.map((file) => `${host}/data-saver/${hash}/${file}`);
  } catch (error) {
    console.error("Gagal memuat halaman:", error);
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
  // Menggunakan thumbnail .256.jpg agar loading gambar di Vercel jauh lebih cepat
  return fileName ? `https://uploads.mangadex.org/covers/${manga.id}/${fileName}.256.jpg` : null;
};

export const fetchChapterPages = async (chapterId) => {
  // At-Home server sebaiknya tetap direct ke domain mangadex karena butuh infrastruktur mereka
  const res = await fetch(`https://api.mangadex.org/at-home/server/${chapterId}`);
  const data = await res.json();
  const host = data.baseUrl;
  const { hash, dataSaver } = data.chapter;
  return dataSaver.map(file => `${host}/data-saver/${hash}/${file}`);
};

// Tambahkan ini di mangadexApi.js
export const fetchGenres = async () => {
  try {
    // Menggunakan BASE_URL yang sudah kita set (mengarah ke /api/mangadex di prod)
    const res = await fetch(`${BASE_URL}/manga/tag`);
    if (!res.ok) throw new Error("Gagal mengambil tags");
    return await res.json();
  } catch (error) {
    console.error("Genre Fetch Error:", error);
    throw error;
  }
};