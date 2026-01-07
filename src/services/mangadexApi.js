const BASE_URL = "https://api.mangadex.org";

// Fungsi Helper untuk Judul
export const getTitle = (manga) => {
  if (!manga?.attributes?.title) return "Unknown Title";
  return manga.attributes.title.en || Object.values(manga.attributes.title)[0];
};

// Fungsi Helper untuk Cover
export const getCoverUrl = (manga) => {
  const coverRel = manga.relationships?.find(rel => rel.type === "cover_art");
  const fileName = coverRel?.attributes?.fileName;
  return fileName ? `https://uploads.mangadex.org/covers/${manga.id}/${fileName}` : null;
};

// 1. Fetch Manga (Bisa untuk Search, Genre, atau Latest)
export const fetchManga = async (params = {}) => {
  try {
    const url = new URL(`${BASE_URL}/manga`);
    
    // Gabungkan parameter default dengan params yang dikirim dari Home.jsx
    const finalParams = {
      limit: 15,
      offset: 0,
      'includes[]': ['cover_art', 'author', 'artist'],
      'contentRating[]': ['safe', 'suggestive'],
      'order[latestUploadedChapter]': 'desc',
      ...params // Menimpa default jika ada params baru (seperti includedTags[])
    };

    // Mapping ke URLSearchParams
    Object.keys(finalParams).forEach(key => {
      if (Array.isArray(finalParams[key])) {
        finalParams[key].forEach(val => url.searchParams.append(key, val));
      } else {
        url.searchParams.append(key, finalParams[key]);
      }
    });

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("MangaDex API Error:", error);
    throw error;
  }
};

// 2. Fetch Detail Satu Manga
export const fetchMangaDetail = async (id) => {
  const res = await fetch(`${BASE_URL}/manga/${id}?includes[]=artist&includes[]=author&includes[]=cover_art`);
  return res.json();
};

// 3. Fetch List Chapter
export const fetchChapters = async (id) => {
  // Kita ambil 100 chapter pertama, bahasa Inggris, diurutkan dari yang terbaru
  const res = await fetch(`${BASE_URL}/manga/${id}/feed?translatedLanguage[]=en&order[chapter]=desc&limit=100&includes[]=scanlation_group`);
  return res.json();
};

// 4. Fetch Halaman Gambar untuk Reader
// export const fetchChapterPages = async (chapterId) => {
//   const res = await fetch(`${BASE_URL}/at-home/server/${chapterId}`);
//   return res.json();
// };
// Menambahkan fungsi untuk mendapatkan data halaman chapter dengan opsi saver
export const fetchChapterPages = async (chapterId) => {
  const res = await fetch(`https://api.mangadex.org/at-home/server/${chapterId}`);
  const data = await res.json();
  
  const host = data.baseUrl;
  const hash = data.chapter.hash;
  
  // Menggunakan data-saver alih-alih data original untuk performa
  const pageFiles = data.chapter.dataSaver; 
  
  return pageFiles.map(file => `${host}/data-saver/${hash}/${file}`);
};

export const fetchMangaFeed = async (mangaId, offset = 0) => {
  const baseUrl = `https://api.mangadex.org/manga/${mangaId}/feed`;
  const params = [
    `limit=96`,
    `includes[]=scanlation_group`,
    `includes[]=user`,
    `order[volume]=desc`,
    `order[chapter]=desc`,
    `offset=${offset}`,
    `contentRating[]=safe`,
    `contentRating[]=suggestive`,
    `contentRating[]=erotica`,
    `contentRating[]=pornographic`,
    `includeUnavailable=0`,
    `excludeExternalUrl=blinktoon.com`
  ].join('&');

  const res = await fetch(`${baseUrl}?${params}`);
  if (!res.ok) throw new Error("Gagal mengambil feed");
  return res.json();
};

export const fetchChapterImages = async (chapterId) => {
  const res = await fetch(`https://api.mangadex.org/at-home/server/${chapterId}`);
  const data = await res.json();
  const host = data.baseUrl;
  const { hash, dataSaver } = data.chapter; // Gunakan dataSaver, bukan data
  
  // URL data-saver biasanya 2-3x lebih cepat diakses
  return dataSaver.map((file) => `${host}/data-saver/${hash}/${file}`);
};

export const fetchLatestUpdates = async (limit = 24, offset = 0) => {
  const params = [
    `limit=${limit}`,
    `offset=${offset}`,
    `includes[]=cover_art`,
    `includes[]=author`,
    `contentRating[]=safe`,
    `contentRating[]=suggestive`,
    `order[latestUploadedChapter]=desc` // Ini adalah kunci untuk memanggil update terbaru
  ].join('&');

  try {
    const response = await fetch(`https://api.mangadex.org/manga?${params}`);
    if (!response.ok) throw new Error("Gagal mengambil data terbaru");
    return await response.json();
  } catch (error) {
    console.error("Latest Update Error:", error);
    throw error;
  }
};

export const fetchMangaChaptersAllLang = async (mangaId, offset = 0) => {
  const params = new URLSearchParams({
    limit: 100,
    offset: offset,
    'contentRating[]': ['safe', 'suggestive', 'erotica', 'pornographic'],
    'order[chapter]': 'desc',
    'includes[]': ['scanlation_group']
  });

  const res = await fetch(`https://api.mangadex.org/manga/${mangaId}/feed?${params.toString()}`);
  return res.json();
};