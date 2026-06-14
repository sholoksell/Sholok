import { apiService } from './api.service';

export interface SearchParams {
  query: string;
  category?: 'all' | 'news' | 'blog' | 'shop' | 'cafe' | 'video';
  page?: number;
  limit?: number;
}

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  url: string;
  image?: string;
  timestamp: string;
}

export const searchService = {
  search: async (params: SearchParams): Promise<{ results: SearchResult[]; total: number }> => {
    return apiService.get('/search', { params });
  },

  getSuggestions: async (query: string): Promise<string[]> => {
    return apiService.get('/search/suggestions', { params: { query } });
  },

  getTrendingKeywords: async (): Promise<string[]> => {
    return apiService.get('/search/trending');
  },
};
