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

export const testbedApi = createApi({
  reducerPath: 'testbedApi',
  // Use relative URL so service worker can intercept
  baseQuery: fetchBaseQuery({ baseUrl: '/api/' }),
  tagTypes: ['Item'],
  endpoints: (builder) => ({
    // GET single item by id
    // Supports forceError flag to simulate server errors
    getItem: builder.query<Item, GetItemArgs>({
      query: ({ id, forceError }) => ({
        url: `items/${id}`,
        params: forceError ? { fail: 'true' } : undefined,
      }),
      providesTags: (_result, _error, { id }) => [{ type: 'Item', id }],
    }),
  }),
})

export const { useGetItemQuery } = testbedApi
