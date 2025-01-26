import axios from 'axios';


const api = axios.create({
  baseURL: import.meta.env.VITE_BIBLE_API_URL,
  headers: {
    'api-key': import.meta.env.VITE_BIBLE_API_KEY,
  },
});


const REINA_VALERA_ID = import.meta.env.VITE_BIBLE_ID;

export const getReinaValeraBooks = async () => {
  const response = await api.get(`/bibles/${REINA_VALERA_ID}/books`);
  return response.data;
};

export const getBookChapters = async (bookId: string) => {
  const response = await api.get(`/bibles/${REINA_VALERA_ID}/books/${bookId}/chapters`);
  return response.data;
};

export const getChapterVerses = async (chapterId: string) => {
  const response = await api.get(`/bibles/${REINA_VALERA_ID}/chapters/${chapterId}/verses`);
  return response.data;
};

export const getVerseText = async (verseId: string) => {
  const response = await api.get(`/bibles/${REINA_VALERA_ID}/verses/${verseId}`);
  return response.data;
};
