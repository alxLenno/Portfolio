import { useCallback, useEffect, useRef, useState } from 'react'

const POLL_INTERVAL_MS = 45000

// Loads a collection from the API, keeps it fresh while the tab is visible,
// and falls back to the bundled starter content if the API is unreachable.
export function useCollection(load, fallback) {
  const [items, setItems] = useState(null)
  const [error, setError] = useState(null)
  const active = useRef(true)

  const fetchItems = useCallback(
    async ({ quiet = false } = {}) => {
      try {
        const data = await load()
        if (!active.current) return

        setItems(Array.isArray(data) ? data : [])
        setError(null)
      } catch (err) {
        if (!active.current || err.name === 'AbortError') return

        setError(err.message)
        if (!quiet) setItems((current) => current ?? fallback)
      }
    },
    [load, fallback],
  )

  useEffect(() => {
    active.current = true
    // Fetching on mount is the external-system case this effect exists for.
    // oxlint-disable-next-line react/set-state-in-effect
    fetchItems()

    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') fetchItems({ quiet: true })
    }, POLL_INTERVAL_MS)

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') fetchItems({ quiet: true })
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      active.current = false
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [fetchItems])

  return {
    items: items ?? [],
    loading: items === null,
    error,
    refetch: () => fetchItems({ quiet: true }),
  }
}
