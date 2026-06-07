import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ScraperUiState {
  selectedItems: string[];
}

const initialState: ScraperUiState = {
  selectedItems: [],
};

const scraperSlice = createSlice({
  name: 'scraperUi',
  initialState,
  reducers: {
    toggleItemSelection: (state, action: PayloadAction<string>) => {
      const item = action.payload;
      if (state.selectedItems.includes(item)) {
        state.selectedItems = state.selectedItems.filter((i) => i !== item);
      } else {
        state.selectedItems.push(item);
      }
    },
    clearSelection: (state) => {
      state.selectedItems = [];
    },
  },
});

export const { toggleItemSelection, clearSelection } = scraperSlice.actions;
export default scraperSlice.reducer;
