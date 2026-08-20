import { useEffect, useState } from 'react'
import { isSupabaseConfigured, supabase, PAPERS_TABLE } from '../lib/supabaseClient'
import { fallbackPapers } from '../data'

export function useResearch() {
  const [papers, setPapers] = useState(isSupabaseConfigured ? null : fallbackPapers)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isSupabaseConfigured) return

    let cancelled = false

    async function load() {
      try {
        const { data, error: fetchError } = await supabase
          .from(PAPERS_TABLE)
          .select('*')
          .order('sort_order', { ascending: true })

        if (cancelled) return

        if (fetchError) throw fetchError

        setPapers(data)
      } catch (err) {
        if (cancelled) return
        setError(err.message)
        setPapers(fallbackPapers)
      }
    }

    load()

    const channel = supabase
      .channel('research-papers-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: PAPERS_TABLE }, load)
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [])

  return { papers: papers ?? [], loading: papers === null, error }
}
