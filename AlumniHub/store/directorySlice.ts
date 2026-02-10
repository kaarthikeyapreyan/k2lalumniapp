import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { DirectoryState, FilterOptions } from '../types';
import { getAlumni, searchAlumni, filterAlumni } from '../mock/services/directoryService';

const initialState: DirectoryState = {
  alumni: [],
  filteredAlumni: [],
  filters: {},
  searchQuery: '',
  isLoading: false,
  error: null,
};

export const fetchAlumni = createAsyncThunk(
  'directory/fetchAlumni',
  async (_, { rejectWithValue }) => {
    try {
      return await getAlumni();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const searchDirectory = createAsyncThunk(
  'directory/search',
  async (query: string, { rejectWithValue }) => {
    try {
      return await searchAlumni(query);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const applyFilters = createAsyncThunk(
  'directory/applyFilters',
  async (filters: FilterOptions, { rejectWithValue }) => {
    try {
      return await filterAlumni(filters);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const directorySlice = createSlice({
  name: 'directory',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setFilters: (state, action: PayloadAction<FilterOptions>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
      state.filteredAlumni = state.alumni;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAlumni.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAlumni.fulfilled, (state, action) => {
        state.isLoading = false;
        state.alumni = action.payload;
        state.filteredAlumni = action.payload;
      })
      .addCase(fetchAlumni.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(searchDirectory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchDirectory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.filteredAlumni = action.payload;
      })
      .addCase(searchDirectory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(applyFilters.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(applyFilters.fulfilled, (state, action) => {
        state.isLoading = false;
        state.filteredAlumni = action.payload;
      })
      .addCase(applyFilters.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setSearchQuery, setFilters, clearFilters } = directorySlice.actions;
export default directorySlice.reducer;
