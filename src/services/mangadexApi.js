// Gunakan konstanta untuk deteksi environment (Proxy Vercel vs Direct)
const IS_PROD = window.location.hostname !== 'localhost';
const BASE_URL = IS_PROD ? '/api/mangadex' : 'https://api.mangadex.org';

// Helper: Serialisasi parameter untuk menangani Array dan Objek (order[key])
const buildQueryParams = (url, params) => {
  Object.keys(params).forEach(key => {
    const value = params[key];

    if (value === undefined || value === null) return;

    // Menangani Nested Object (contoh: order: { updatedAt: 'desc' })
    if (typeof value === 'object' && !Array.isArray(value)) {
      Object.keys(value).forEach(subKey => {
        url.searchParams.append(`${key}[${subKey}]`, value[subKey]);
      });
    } 
    // Menangani Array (contoh: includes: ['cover_art', 'author'])
    else if (Array.isArray(value)) {
      value.forEach(val => url.searchParams.append(key.includes('[]') ? key : `${key}[]`, val));
    } 
    // Menangani nilai standar
    else {
      url.searchParams.append(key, value);
    }
  });
};

export const fetchManga = async (params = {}, options = {}) => {
  try {
    const url = new URL(`${BASE_URL}/manga`);
    
    // Parameter Default
    const defaultParams = {
      limit: 15,
      offset: 0,
      'includes[]': ['cover_art', 'author', 'artist'],
      'contentRating[]': ['safe', 'suggestive'],
    };

    // Gabungkan default dengan params input
    const finalParams = { ...defaultParams, ...params };

    // Hapus order default jika ada order kustom dari params untuk cegah duplikasi
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

// --- Fungsi Helper Lainnya Tetap Sama Namun Menggunakan BASE_URL ---

export const fetchMangaDetail = async (id) => {
  const res = await fetch(`${BASE_URL}/manga/${id}?includes[]=artist&includes[]=author&includes[]=cover_art`);
  return res.json();
};

export const fetchChapters = async (id) => {
  const res = await fetch(`${BASE_URL}/manga/${id}/feed?translatedLanguage[]=en&order[chapter]=desc&limit=100&includes[]=scanlation_group`);
  return res.json();
};

export const fetchChapterPages = async (chapterId) => {
  // At-Home server sebaiknya tetap direct ke domain mangadex karena butuh infrastruktur mereka
  const res = await fetch(`https://api.mangadex.org/at-home/server/${chapterId}`);
  const data = await res.json();
  const host = data.baseUrl;
  const { hash, dataSaver } = data.chapter;
  return dataSaver.map(file => `${host}/data-saver/${hash}/${file}`);
};

export const getTitle = (manga) => {
  if (!manga?.attributes?.title) return "Unknown Title";
  return manga.attributes.title.en || Object.values(manga.attributes.title)[0];
};

export const getCoverUrl = (manga) => {
  const coverRel = manga.relationships?.find(rel => rel.type === "cover_art");
  const fileName = coverRel?.attributes?.fileName;
  return fileName ? `https://uploads.mangadex.org/covers/${manga.id}/${fileName}.256.jpg` : null;
};

// Tambahkan fungsi ini di mangadexApi.js
export const fetchMangaFeed = async (mangaId, offset = 0) => {
  const url = new URL(`${BASE_URL}/manga/${mangaId}/feed`);
  
  const params = {
    limit: 96,
    offset: offset,
    'includes[]': ['scanlation_group', 'user'],
    'order[volume]': 'desc',
    'order[chapter]': 'desc',
    'contentRating[]': ['safe', 'suggestive', 'erotica', 'pornographic'],
    includeUnavailable: 0,
  };

  // Gunakan helper buildQueryParams yang sudah kita buat sebelumnya
  buildQueryParams(url, params);

  try {
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error("Gagal mengambil feed chapter");
    return await res.json();
  } catch (error) {
    console.error("Feed Error:", error);
    throw error;
  }
};