import { useCallback } from 'react'
import { api } from '../lib/api'
import { fallbackPapers } from '../data'
import { useCollection } from './useCollection'

export function useResearch() {
  const load = useCallback(() => api.papers.list(), [])
  const { items, loading, error, refetch } = useCollection(load, fallbackPapers)

  return { papers: items, loading, error, refetch }
}
