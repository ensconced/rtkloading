import { configureStore } from '@reduxjs/toolkit'
import { testbedApi } from './testbedApi'

export const store = configureStore({
  reducer: {
    [testbedApi.reducerPath]: testbedApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(testbedApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
