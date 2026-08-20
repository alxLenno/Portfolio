import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase = isSupabaseConfigured ? createClient(url, anonKey) : null

export const PROJECTS_TABLE = 'projects'
export const PAPERS_TABLE = 'research_papers'
export const BOOKS_TABLE = 'books'
export const MEDIA_BUCKET = 'project-media'

export async function uploadMedia(file, folder) {
  const ext = file.name.split('.').pop()
  const path = `${folder}/${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file)
  if (error) throw error

  return supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl
}
