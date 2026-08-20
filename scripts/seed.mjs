// One-time script to load the starter projects (and their local screenshots)
// into Supabase. Run once after setting up supabase/schema.sql.
//
// Usage:
//   SUPABASE_URL=https://your-project.supabase.co \
//   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
//   node scripts/seed.mjs
//
// The service role key bypasses row-level security, so it belongs only in
// your shell for this one-off run — never in a committed file or the app.

import { createClient } from '@supabase/supabase-js'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { fallbackProjects, fallbackPapers, fallbackBooks } from '../src/data.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const url = process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars first (see comment at top of this file).')
  process.exit(1)
}

const supabase = createClient(url, serviceKey)

async function uploadLocalImage(localPath) {
  if (!localPath || !localPath.startsWith('/projects/')) return localPath

  const filePath = path.join(__dirname, '..', 'public', localPath)
  const fileBuffer = await readFile(filePath)
  const storagePath = `seed/${path.basename(localPath)}`

  const { error } = await supabase.storage
    .from('project-media')
    .upload(storagePath, fileBuffer, { contentType: 'image/png', upsert: true })

  if (error) {
    console.error(`  ! Failed to upload ${localPath}: ${error.message}`)
    return null
  }

  return supabase.storage.from('project-media').getPublicUrl(storagePath).data.publicUrl
}

async function alreadyExists(table, column, value) {
  const { data } = await supabase.from(table).select('id').eq(column, value).limit(1)
  return Boolean(data?.length)
}

for (const project of fallbackProjects) {
  if (await alreadyExists('projects', 'name', project.name)) {
    console.log(`  · Skipped "${project.name}" (already exists)`)
    continue
  }

  const image_url = await uploadLocalImage(project.image_url)

  const { error } = await supabase.from('projects').insert({
    name: project.name,
    description: project.description,
    tech: project.tech,
    live_url: project.live_url,
    github_url: project.github_url,
    image_url,
    video_url: project.video_url,
    sort_order: project.sort_order,
  })

  console.log(error ? `  ! Failed "${project.name}": ${error.message}` : `  ✓ Seeded "${project.name}"`)
}

for (const paper of fallbackPapers) {
  if (await alreadyExists('research_papers', 'title', paper.title)) {
    console.log(`  · Skipped "${paper.title}" (already exists)`)
    continue
  }

  const { error } = await supabase.from('research_papers').insert({
    title: paper.title,
    venue: paper.venue,
    status: paper.status,
    date_label: paper.date_label,
    authors: paper.authors,
    abstract: paper.abstract,
    paper_url: paper.paper_url,
    sort_order: paper.sort_order,
  })

  console.log(error ? `  ! Failed "${paper.title}": ${error.message}` : `  ✓ Seeded "${paper.title}"`)
}

for (const book of fallbackBooks) {
  if (await alreadyExists('books', 'title', book.title)) {
    console.log(`  · Skipped "${book.title}" (already exists)`)
    continue
  }

  const cover_url = await uploadLocalImage(book.cover_url)

  const { error } = await supabase.from('books').insert({
    title: book.title,
    authors: book.authors,
    status: book.status,
    year_label: book.year_label,
    description: book.description,
    link: book.link,
    cover_url,
    sort_order: book.sort_order,
  })

  console.log(error ? `  ! Failed "${book.title}": ${error.message}` : `  ✓ Seeded "${book.title}"`)
}

console.log('Done.')
