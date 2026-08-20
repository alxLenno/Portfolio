import { useProjects } from '../hooks/useProjects'
import { ExternalLinkIcon, GitHubIcon } from './icons'

export default function Projects() {
  const { projects, loading } = useProjects()

  return (
    <section id="projects" className="section">
      <div className="section-inner">
        <p className="section__eyebrow">Projects</p>
        <h2 className="section__title">Things I&rsquo;ve built</h2>

        {loading ? (
          <p className="projects__status">Loading projects…</p>
        ) : (
          <div className="projects__grid">
            {projects.map((p) => (
              <article key={p.id ?? p.name} className="project-card">
                {(p.video_url || p.image_url) && (
                  <div className="project-card__media">
                    {p.video_url ? (
                      <video src={p.video_url} poster={p.image_url ?? undefined} controls />
                    ) : (
                      <img src={p.image_url} alt={`${p.name} screenshot`} loading="lazy" />
                    )}
                  </div>
                )}
                <div className="project-card__body">
                  <h3>{p.name}</h3>
                  <p>{p.description}</p>
                  <ul className="project-card__tech">
                    {p.tech.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
                <div className="project-card__links">
                  {p.live_url && (
                    <a href={p.live_url} target="_blank" rel="noreferrer">
                      <ExternalLinkIcon width={15} height={15} /> Live
                    </a>
                  )}
                  {p.github_url && (
                    <a href={p.github_url} target="_blank" rel="noreferrer">
                      <GitHubIcon width={15} height={15} /> Code
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
