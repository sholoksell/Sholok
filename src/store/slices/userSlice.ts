import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserPreferences {
  theme: 'light' | 'dark';
  language: 'EN' | 'BN';
  notifications: boolean;
}

interface UserState {
  preferences: UserPreferences;
  bookmarks: string[];
  recentSearches: string[];
}

const initialState: UserState = {
  preferences: {
    theme: 'light',
    language: 'EN',
    notifications: true,
  },
  bookmarks: [],
  recentSearches: [],
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setPreferences: (state, action: PayloadAction<Partial<UserPreferences>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    addBookmark: (state, action: PayloadAction<string>) => {
      if (!state.bookmarks.includes(action.payload)) {
        state.bookmarks.push(action.payload);
      }
    },
    removeBookmark: (state, action: PayloadAction<string>) => {
      state.bookmarks = state.bookmarks.filter((id) => id !== action.payload);
    },
    addRecentSearch: (state, action: PayloadAction<string>) => {
      state.recentSearches = [action.payload, ...state.recentSearches.filter((s) => s !== action.payload)].slice(0, 10);
    },
    clearRecentSearches: (state) => {
      state.recentSearches = [];
    },
  },
});

export const { setPreferences, addBookmark, removeBookmark, addRecentSearch, clearRecentSearches } = userSlice.actions;
export default userSlice.reducer;
