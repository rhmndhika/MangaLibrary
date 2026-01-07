/**
 * MANGADEX API SERVICE - FINAL REVISED (NGROK & VERCEL COMPATIBLE)
 */

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname.includes('ngrok-free.dev')) {
      return `${window.location.origin}/api-proxy`;
    }
  }
  
  const isProd = typeof window !== 'undefined' && window.location.hostname !== 'localhost';
  return isProd 
    ? `${window.location.origin}/api/mangadex` 
    : 'https://api.mangadex.org';
};

const BASE_URL = getBaseUrl();

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true'
});

const buildQueryParams = (urlObj, params) => {
  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value === undefined || value === null) return;

    if (typeof value === 'object' && !Array.isArray(value)) {
      Object.keys(value).forEach(subKey => {
        urlObj.searchParams.append(`${key}[${subKey}]`, value[subKey]);
      });
    } else if (Array.isArray(value)) {
      value.forEach(val => {
        const cleanKey = key.includes('[]') ? key : `${key}[]`;
        urlObj.searchParams.append(cleanKey, val);
      });
    } else {
      urlObj.searchParams.append(key, value);
    }
  });
};

export const fetchGenres = async () => {
  try {
    const res = await fetch(`${BASE_URL}/manga/tag`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Gagal mengambil tags");
    return await res.json();
  } catch (error) {
    console.error("Genre Fetch Error:", error);
    throw error;
  }
};

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
      headers: getHeaders(),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') return null;
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
  const res = await fetch(url.toString(), { headers: getHeaders() });
  if (!res.ok) throw new Error("Gagal mengambil update terbaru");
  return res.json();
};

export const fetchMangaDetail = async (id) => {
  const res = await fetch(
    `${BASE_URL}/manga/${id}?includes[]=artist&includes[]=author&includes[]=cover_art`,
    { headers: getHeaders() }
  );
  if (!res.ok) throw new Error("Gagal mengambil detail manga");
  return res.json();
};

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
  const res = await fetch(url.toString(), { headers: getHeaders() });
  if (!res.ok) throw new Error("Gagal mengambil feed chapter");
  return res.json();
};

export const fetchChapterPages = async (chapterId) => {
  try {
    const res = await fetch(`${BASE_URL}/at-home/server/${chapterId}`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Gagal mengambil data server gambar");
    
    const data = await res.json();
    const host = data.baseUrl;
    const { hash, dataSaver } = data.chapter; 
    
    return dataSaver.map((file) => `${host}/data-saver/${hash}/${file}`);
  } catch (error) {
    console.error("Gagal memuat halaman chapter:", error);
    throw error;
  }
};

export const getTitle = (manga) => {
  if (!manga?.attributes?.title) return "Unknown Title";
  return manga.attributes.title.en || Object.values(manga.attributes.title)[0];
};

export const getCoverUrl = (manga) => {
  const coverRel = manga.relationships?.find(rel => rel.type === "cover_art");
  const fileName = coverRel?.attributes?.fileName;
  
  return fileName 
    ? `https://uploads.mangadex.org/covers/${manga.id}/${fileName}.256.jpg` 
    : null;
};