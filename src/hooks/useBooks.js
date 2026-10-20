import { useCallback } from 'react'
import { api } from '../lib/api'
import { fallbackBooks } from '../data'
import { useCollection } from './useCollection'

export function useBooks() {
  const load = useCallback(() => api.books.list(), [])
  const { items, loading, error, refetch } = useCollection(load, fallbackBooks)

  return { books: items, loading, error, refetch }
}
