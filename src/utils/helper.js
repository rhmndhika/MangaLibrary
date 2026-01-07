export const formatChapterTitle = (chapter) => {
  const num = chapter.attributes.chapter;
  const title = chapter.attributes.title;
  return `Chapter ${num || '?'} ${title ? `- ${title}` : ''}`;
};

export const saveToLocal = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const getFromLocal = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};