import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SearchState {
  query: string;
  category: 'all' | 'news' | 'blog' | 'shop' | 'cafe' | 'video';
  results: any[];
  isLoading: boolean;
  suggestions: string[];
}

const initialState: SearchState = {
  query: '',
  category: 'all',
  results: [],
  isLoading: false,
  suggestions: [],
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
    },
    setSearchCategory: (state, action: PayloadAction<SearchState['category']>) => {
      state.category = action.payload;
    },
    setSearchResults: (state, action: PayloadAction<any[]>) => {
      state.results = action.payload;
      state.isLoading = false;
    },
    setSearchLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setSuggestions: (state, action: PayloadAction<string[]>) => {
      state.suggestions = action.payload;
    },
    clearSearch: (state) => {
      state.query = '';
      state.results = [];
      state.suggestions = [];
    },
  },
});

export const { setSearchQuery, setSearchCategory, setSearchResults, setSearchLoading, setSuggestions, clearSearch } = searchSlice.actions;
export default searchSlice.reducer;
