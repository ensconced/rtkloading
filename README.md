# RTK Query useQuery Testbed

An interactive testbed to explore the behavior of RTK Query's `useQuery` hook return values.

## Questions This Helps Answer

- When exactly is `isLoading` true? Is it per-argument or global?
- How does `isFetching` differ from `isLoading`?
- What's the difference between `data` and `currentData`?
- How do cache entries work with different arguments?
- How do errors affect `data` and `currentData`?

## Running the Testbed

```bash
npm install
npm run dev
```

That's it! The app uses a **Service Worker** to mock the API — no backend server needed. Everything runs in the browser.

Open http://localhost:5173 and start exploring.

## Experiments to Try

### 1. data vs currentData

1. Click **Item 1**, wait for it to load
2. Click **Item 2** (uncached)
3. **Watch:** What happens to `data` vs `currentData` during the transition?

You should see that `data` can show data from a *different* argument than the one you're currently requesting. That's what makes it different from `currentData`.

### 2. isLoading behavior

1. Fresh page load, click **Item 1** → observe `isLoading`
2. Wait for load, click **Item 2** (uncached) → is `isLoading` true?
3. Click **Refetch** on a loaded item → is `isLoading` true?

Pay attention to whether `isLoading` cares about:
- Having *any* cached data (regardless of arg), or
- Having cached data for the *current* arg specifically

### 3. isFetching vs isLoading

1. Load an item fully
2. Click **Refetch**
3. Compare `isFetching` and `isLoading`

### 4. Error behavior

1. Load Item 1 successfully
2. Check **"Force errors on next fetch"**
3. Click **Refetch** → what happens to `data`? Does it disappear or stay?
4. What about `currentData`?

### 5. Error then success recovery

1. With errors forced ON, switch to an uncached item (fails)
2. Turn errors OFF, click **Refetch**
3. Is `isLoading` true on the retry? Why or why not?

### 6. Cache key includes forceError!

Notice: `{id: 1, forceError: false}` and `{id: 1, forceError: true}` are **different cache entries**. Toggling the checkbox is like switching args entirely.

### 7. Cache invalidation

1. Load all 3 items
2. Click **Invalidate This** → what refetches?
3. Click **Invalidate All** → what refetches?

## What the UI Shows

- **State Panel**: Real-time values of `isLoading`, `isFetching`, `isError`, `isSuccess`, `data`, `currentData`, `error`
- **Cache State**: All cache entries and their statuses (so you can see the full picture)
- **Timeline**: Logs state changes with timestamps
- **Warning highlight**: When `data` is showing data from a different argument than selected
- **Error toggle**: Force the next fetch to fail with a server error
