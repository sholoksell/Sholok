const BASE = '/news-api/public';

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

export async function fetchFeatured() {
  return get('/featured');
}

export async function fetchBreaking() {
  return get('/breaking');
}

export async function fetchLatest(limit = 10) {
  return get(`/latest?limit=${limit}`);
}

export async function fetchMostRead(limit = 5) {
  return get(`/most-read?limit=${limit}`);
}

export async function fetchNews({ category, page = 1, limit = 10 } = {}) {
  const p = new URLSearchParams({ page, limit });
  if (category) p.set('category', category);
  return get(`/news?${p}`);
}

export async function fetchArticle(slug) {
  return get(`/article/${encodeURIComponent(slug)}`);
}

export async function fetchCategories() {
  return get('/categories');
}

export async function searchNews(q, page = 1) {
  return get(`/search?q=${encodeURIComponent(q)}&page=${page}`);
}
