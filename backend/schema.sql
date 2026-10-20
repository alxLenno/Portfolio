-- SQLite schema for the portfolio backend.
-- Applied automatically on startup (and by `flask --app backend init-db`).

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  tech TEXT NOT NULL DEFAULT '[]',
  live_url TEXT,
  github_url TEXT,
  image_url TEXT,
  video_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS projects_order_idx ON projects (sort_order, created_at);

CREATE TABLE IF NOT EXISTS research_papers (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  venue TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Presented',
  date_label TEXT,
  authors TEXT,
  abstract TEXT,
  paper_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS research_papers_order_idx ON research_papers (sort_order, created_at);

CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  authors TEXT,
  status TEXT NOT NULL DEFAULT 'Published',
  year_label TEXT,
  cover_url TEXT,
  link TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS books_order_idx ON books (sort_order, created_at);
