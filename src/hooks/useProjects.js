import { useEffect, useState } from 'react'
import { isSupabaseConfigured, supabase, PROJECTS_TABLE } from '../lib/supabaseClient'
import { fallbackProjects } from '../data'

export function useProjects() {
  const [projects, setProjects] = useState(isSupabaseConfigured ? null : fallbackProjects)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isSupabaseConfigured) return

    let cancelled = false

    async function load() {
      try {
        const { data, error: fetchError } = await supabase
          .from(PROJECTS_TABLE)
          .select('*')
          .order('sort_order', { ascending: true })

        if (cancelled) return

        if (fetchError) throw fetchError

        setProjects(data)
      } catch (err) {
        if (cancelled) return
        setError(err.message)
        setProjects(fallbackProjects)
      }
    }

    load()

    const channel = supabase
      .channel('projects-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: PROJECTS_TABLE }, load)
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [])

  return { projects: projects ?? [], loading: projects === null, error }
}
