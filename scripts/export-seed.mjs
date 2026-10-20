// Exports the starter content in src/data.js to backend/seed.json.
// The Flask backend loads that file with `flask --app backend seed`.
//
// Usage:
//   npm run seed:export

import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { fallbackProjects, fallbackPapers, fallbackBooks } from '../src/data.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outputPath = path.join(__dirname, '..', 'backend', 'seed.json')

const payload = {
  projects: fallbackProjects,
  papers: fallbackPapers,
  books: fallbackBooks,
}

await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')

console.log(
  `Wrote ${payload.projects.length} projects, ${payload.papers.length} papers, ` +
    `${payload.books.length} books to backend/seed.json`,
)
