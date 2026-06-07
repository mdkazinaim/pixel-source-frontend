import { configureStore } from '@reduxjs/toolkit';
import scraperReducer from './slice/scraperSlice';
import { baseApi } from './api/baseApi';

export const store = configureStore({
  reducer: {
    scraper: scraperReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
