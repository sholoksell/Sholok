const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Generic fetch wrapper with error handling.
 * In production, replace mock data with real API calls using this utility.
 *
 * Usage:
 *   const news = await fetchNews('national', 'bn', { page: 1, limit: 10 });
 */
export async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch news by category, language, and pagination.
 *
 * Example API structure:
 *   GET /api/news?category=national&lang=bn&page=1&limit=10
 *
 * For local development, use the mock data from src/data/mockNews.js.
 * In production, wire this to your backend (Express, Django, Strapi, etc.)
 */
export async function fetchNews(category, lang = 'bn', { page = 1, limit = 10 } = {}) {
  return apiFetch(`/news?category=${encodeURIComponent(category)}&lang=${encodeURIComponent(lang)}&page=${page}&limit=${limit}`);
}

export async function fetchBreakingNews(lang = 'bn') {
  return apiFetch(`/breaking-news?lang=${encodeURIComponent(lang)}`);
}

export async function fetchFeaturedStory(lang = 'bn') {
  return apiFetch(`/featured?lang=${encodeURIComponent(lang)}`);
}

export async function fetchMostRead(lang = 'bn') {
  return apiFetch(`/most-read?lang=${encodeURIComponent(lang)}`);
}

/**
 * Search news articles.
 *
 *   GET /api/search?q=climate&lang=en&page=1
 */
export async function searchNews(query, lang = 'bn', page = 1) {
  return apiFetch(`/search?q=${encodeURIComponent(query)}&lang=${encodeURIComponent(lang)}&page=${page}`);
}
