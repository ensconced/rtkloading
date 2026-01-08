import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export interface ScreeningListItem {
  id: number
  title: string
}

export interface Screening {
  id: number
  title: string
  status: 'open' | 'closed'
  assignee: 'adam' | 'joe'
  riskScore: number
}

export interface UpdateScreeningRequest {
  id: number
  status?: 'open' | 'closed'
  assignee?: 'adam' | 'joe'
}

export const screeningsApi = createApi({
  reducerPath: 'screeningsApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3001/api/' }),
  tagTypes: ['Screening'],
  endpoints: (builder) => ({
    // GET list of all screenings
    getScreeningList: builder.query<ScreeningListItem[], void>({
      query: () => 'screenings',
    }),

    // GET single screening by id
    getScreening: builder.query<Screening, number>({
      query: (id) => `screenings/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Screening', id }],
    }),

    // PATCH update screening - optimistic update + revalidate to sync with server
    updateScreening: builder.mutation<Screening, UpdateScreeningRequest>({
      query: ({ id, ...body }) => ({
        url: `screenings/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Screening', id }],
      async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
        // Optimistically update the cache
        const patchResult = dispatch(
          screeningsApi.util.updateQueryData('getScreening', id, (draft) => {
            Object.assign(draft, patch)
          })
        )
        try {
          await queryFulfilled
        } catch {
          // Revert on error
          patchResult.undo()
        }
      },
    }),
  }),
})

export const {
  useGetScreeningListQuery,
  useGetScreeningQuery,
  useUpdateScreeningMutation,
} = screeningsApi
