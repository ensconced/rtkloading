import { configureStore } from '@reduxjs/toolkit'
import { screeningsApi } from './screeningsApi'

export const store = configureStore({
  reducer: {
    [screeningsApi.reducerPath]: screeningsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(screeningsApi.middleware),
})
