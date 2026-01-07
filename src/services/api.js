const BASE_URL = "https://api.mangadex.org";

export const getTitle = (manga) => {
  return manga.attributes.title.en || Object.values(manga.attributes.title)[0];
};

export const getCoverUrl = (manga) => {
  const coverRel = manga.relationships.find(rel => rel.type === "cover_art");
  const fileName = coverRel?.attributes?.fileName;
  return fileName ? `https://uploads.mangadex.org/covers/${manga.id}/${fileName}` : null;
};

export const fetchMangaDetail = async (id) => {
  const res = await fetch(`${BASE_URL}/manga/${id}?includes[]=cover_art&includes[]=author`);
  return res.json();
};

export const fetchChapters = async (id) => {
  const res = await fetch(`${BASE_URL}/manga/${id}/feed?translatedLanguage[]=en&order[chapter]=asc&limit=100`);
  return res.json();
};