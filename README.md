# RTK Query Todo App

A simple React app demonstrating RTK Query mutations with `invalidatesTags` for automatic cache invalidation.

## How it works

- **`providesTags`**: The `getTodos` query provides the `'Todos'` tag
- **`invalidatesTags`**: Each mutation (`addTodo`, `toggleTodo`, `deleteTodo`) invalidates the `'Todos'` tag
- When a mutation completes, RTK Query automatically refetches any queries that provided the invalidated tag

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

This runs both:
- Express server on http://localhost:3001
- Vite dev server on http://localhost:5173

## Key Files

- `src/todosApi.ts` - RTK Query API with providesTags/invalidatesTags
- `server/index.ts` - Express backend
- `server/db.json` - JSON file database

## Tech Stack

- React 19
- Redux Toolkit 2.x with RTK Query
- Express 5
- Vite + TypeScript
