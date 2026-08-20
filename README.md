# Lennox Kahati — Portfolio

A React + Vite portfolio. Content lives in [`src/data.js`](src/data.js); projects are
managed from a live admin page backed by Supabase.

## Local development

```bash
npm install
npm run dev
```

## Setting up the admin page (`/admin`)

The public site works out of the box using the starter projects in `src/data.js`. To be
able to add/edit/delete projects and upload screenshots or videos from the live site,
connect a free Supabase project:

1. **Create a project** at [supabase.com](https://supabase.com) (free tier is enough).
2. **Run the schema.** Open your project's SQL Editor and run the contents of
   [`supabase/schema.sql`](supabase/schema.sql). This creates the `projects` table, its
   security policies, and the `project-media` storage bucket for uploads.
3. **Create your admin login.** In the Supabase dashboard go to
   Authentication → Users → Add user, and set an email/password for yourself. There's no
   public sign-up form on the site — this is the only account that can ever log in to
   `/admin`.
4. **Connect the app.** In Supabase, go to Settings → API and copy the Project URL and
   the `anon` `public` key (safe to expose in the browser — it's protected by the row
   security policies from step 2, not secrecy). Put them in `.env.local`:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
   Restart `npm run dev` after editing this file. When deploying, add the same two
   variables in your host's environment variable settings (e.g. Vercel → Project →
   Settings → Environment Variables).
5. **(Optional) Load the starter projects into Supabase.** This uploads the existing
   screenshots and inserts the five starter projects so you don't have to re-add them by
   hand:
   ```bash
   SUPABASE_URL=https://your-project.supabase.co \
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
   npm run seed
   ```
   The service role key is under Settings → API → `service_role` — it bypasses all
   security rules, so only use it in your own terminal for this one-off command. Never
   put it in `.env.local`, commit it, or use it in the app itself.

Once connected, visit `/admin`, sign in, and manage projects — changes appear on the
public site immediately (no rebuild/redeploy needed).

## Deploying

Any static host works (Vercel, Netlify, GitHub Pages) since Supabase is called directly
from the browser — there's no server to run. A `vercel.json` and `public/_redirects` are
included so the `/admin` route resolves correctly after a page refresh on Vercel and
Netlify respectively.

```bash
npm run build   # outputs to dist/
```

## Project structure

- `src/data.js` — profile, experience, skills, education, certifications (static)
- `src/hooks/useProjects.js` — fetches projects from Supabase, falling back to the
  starter data in `data.js` if Supabase isn't configured
- `src/admin/` — the `/admin` login + project management UI
- `supabase/schema.sql` — database schema and security policies to run once
- `scripts/seed.mjs` — one-time script to load the starter projects into Supabase
- `cv/Lennox_Kahati_CV.tex` — LaTeX source for the downloadable résumé (recompile with
  `pdflatex Lennox_Kahati_CV.tex`, then copy the PDF to `public/Lennox_Kahati_CV.pdf`)
