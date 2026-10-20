import { useCallback } from 'react'
import { api } from '../lib/api'
import { fallbackProjects } from '../data'
import { useCollection } from './useCollection'

export function useProjects() {
  const load = useCallback(() => api.projects.list(), [])
  const { items, loading, error, refetch } = useCollection(load, fallbackProjects)

  return { projects: items, loading, error, refetch }
}
