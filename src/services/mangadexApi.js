/**
 * MANGADEX API SERVICE - FINAL REVISED (NGROK & VERCEL COMPATIBLE)
 */
import axios from 'axios';

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

/**
 * Fungsi untuk mencari manga berdasarkan judul
 * @param {string} title - Judul manga yang dicari
 * @param {number} limit - Jumlah hasil per halaman (default 20)
 */
export const searchManga = async (title, limit = 20) => {
  try {
    // Kita menyertakan 'cover_art' di includes agar 
    // data cover langsung tersedia tanpa fetch tambahan
    const response = await fetch(
      `${BASE_URL}/manga?title=${encodeURIComponent(title)}&limit=${limit}&includes[]=cover_art&contentRating[]=safe&contentRating[]=suggestive`
    );

    if (!response.ok) {
      throw new Error('Gagal mengambil data dari MangaDex');
    }

    const data = await response.json();
    return data; // Mengembalikan objek { result: 'ok', data: [...], total: X }
  } catch (error) {
    console.error("Search Manga Error:", error);
    throw error;
  }
};

export const fetchMangaChapters = async (mangaId, language = 'en') => {
  try {
    const response = await fetch(
      `${BASE_URL}manga/${mangaId}/feed?translatedLanguage[]=${language}&limit=500&order[chapter]=desc&includeExternalUrl=0`
    );
    if (!response.ok) throw new Error("Gagal mengambil daftar chapter");
    const data = await response.json();
    return data.data; // Mengembalikan array chapter
  } catch (error) {
    console.error("Error fetchMangaChapters:", error);
    return [];
  }
};

const AUTH_URL = "https://auth.mangadex.org/realms/mangadex/protocol/openid-connect/token";

// Data dari secret yang Anda berikan
// Client ID biasanya adalah bagian awal (personal-client-...)
// Client Secret adalah bagian kodenya
const CLIENT_ID = "personal-client-ba9cab2a-990e-4f61-b132-df21988ab6a4"; 
const CLIENT_SECRET = "fb8666c1"; 

export const loginMangaDex = async (username, password) => {
  try {
    // Menggunakan URLSearchParams secara otomatis menetapkan 
    // Content-Type ke application/x-www-form-urlencoded
    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('username', username); // Bisa username atau email
    params.append('password', password);
    params.append('client_id', CLIENT_ID);
    params.append('client_secret', CLIENT_SECRET);

    const response = await axios.post(AUTH_URL, params);

    const { access_token, refresh_token } = response.data;

    // Simpan ke local storage
    localStorage.setItem('md_access_token', access_token);
    localStorage.setItem('md_refresh_token', refresh_token);
    
    return response.data;
  } catch (error) {
    console.error("Auth Error Detail:", error.response?.data);
    throw new Error(error.response?.data?.error_description || "Login Gagal");
  }
};

// Fungsi pendukung untuk mendapatkan token yang tersimpan
export const getStoredToken = () => localStorage.getItem('md_access_token');

export const refreshMangaDexToken = async (clientId, clientSecret) => {
  try {
    const refreshToken = localStorage.getItem('md_refresh_token');
    if (!refreshToken) throw new Error("No refresh token found");

    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', refreshToken);
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);

    const response = await fetch(AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    const data = await response.json();
    localStorage.setItem('md_access_token', data.access_token);
    if (data.refresh_token) localStorage.setItem('md_refresh_token', data.refresh_token);
    
    return data.access_token;
  } catch (error) {
    console.error("Refresh Token Error:", error);
    return null;
  }
};