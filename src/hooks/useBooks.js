import { useEffect, useState } from 'react'
import { isSupabaseConfigured, supabase, BOOKS_TABLE } from '../lib/supabaseClient'
import { fallbackBooks } from '../data'

export function useBooks() {
  const [books, setBooks] = useState(isSupabaseConfigured ? null : fallbackBooks)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isSupabaseConfigured) return

    let cancelled = false

    async function load() {
      try {
        const { data, error: fetchError } = await supabase
          .from(BOOKS_TABLE)
          .select('*')
          .order('sort_order', { ascending: true })

        if (cancelled) return

        if (fetchError) throw fetchError

        setBooks(data)
      } catch (err) {
        if (cancelled) return
        setError(err.message)
        setBooks(fallbackBooks)
      }
    }

    load()

    const channel = supabase
      .channel('books-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: BOOKS_TABLE }, load)
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [])

  return { books: books ?? [], loading: books === null, error }
}
