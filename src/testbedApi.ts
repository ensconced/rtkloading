import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export interface Item {
  id: number
  name: string
  value: number
  fetchCount: number
  fetchedAt: string
}

export interface GetItemArgs {
  id: number
  forceError?: boolean
}

// Default: keep unused data for 60 seconds
// We'll make this configurable via the UI
let keepUnusedDataForSeconds = 10

export const setKeepUnusedDataFor = (seconds: number) => {
  keepUnusedDataForSeconds = seconds
}

export const getKeepUnusedDataFor = () => keepUnusedDataForSeconds

export const testbedApi = createApi({
  reducerPath: 'testbedApi',
  // Use relative URL so service worker can intercept
  baseQuery: fetchBaseQuery({ baseUrl: '/api/' }),
  // Note: keepUnusedDataFor is set at API creation time, so changing it requires
  // a page refresh. We set a short default (10s) for demo purposes.
  keepUnusedDataFor: 10,
  tagTypes: ['Item'],
  endpoints: (builder) => ({
    // GET single item by id
    // Supports forceError flag to simulate server errors
    getItem: builder.query<Item, GetItemArgs>({
      query: ({ id, forceError }) => ({
        url: `items/${id}`,
        params: forceError ? { fail: 'true' } : undefined,
      }),
      // Only use `id` for the cache key — forceError just affects the request, not the cache entry
      serializeQueryArgs: ({ queryArgs }) => {
        return queryArgs.id
      },
      providesTags: (_result, _error, { id }) => [{ type: 'Item', id }],
    }),
  }),
})

export const { useGetItemQuery } = testbedApi
