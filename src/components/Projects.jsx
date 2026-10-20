import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProjects } from '../hooks/useProjects'
import { ExternalLinkIcon, GitHubIcon } from './icons'

function ProjectMedia({ project }) {
  const [failedImage, setFailedImage] = useState(null)
  const cover = project.image_url
    ? { type: 'image', url: project.image_url }
    : project.video_url
      ? { type: 'video', url: project.video_url }
      : null

  const additionalMedia = project.image_url && project.video_url
    ? [{ type: 'video', url: project.video_url, label: 'Video' }]
    : []

  if (!cover || (cover.type === 'image' && failedImage === cover.url)) return (
    <div className="project-card__media project-card__placeholder" aria-label={`${project.name}: preview unavailable`}>
      <span aria-hidden="true">{project.name.split(' ').map(word => word[0]).slice(0, 2).join('')}</span>
      <p>{project.name}</p>
    </div>
  )

  return (
    <>
      <div className="project-card__media project-card__cover">
        {cover.type === 'image' ? (
          <img src={cover.url} alt={`${project.name} screenshot`} loading="lazy" decoding="async" onError={() => setFailedImage(cover.url)} />
        ) : (
          <video src={cover.url} controls preload="metadata" />
        )}
      </div>

      {additionalMedia.length > 0 && (
        <details className="project-card__more-media">
          <summary>
            <span>More media</span>
            <em>1 video</em>
          </summary>
          <div className="project-card__media-list">
            {additionalMedia.map((file) => (
              <figure key={`${file.type}-${file.url}`} className="project-card__media-file">
                <figcaption>{file.label}</figcaption>
                <div className="project-card__media">
                  <video
                    src={file.url}
                    poster={project.image_url}
                    controls
                    preload="metadata"
                  />
                </div>
              </figure>
            ))}
          </div>
        </details>
      )}
    </>
  )
}

export default function Projects({ featured = false }) {
  const { projects, loading, error } = useProjects()
  const Heading = featured ? 'h2' : 'h1'
  const visibleProjects = featured ? projects.slice(0, 3) : projects

  return (
    <section id="projects" className="section projects-page">
      <div className="section-inner">
        <div className="page-heading">
          <div>
            <p className="section__eyebrow">Selected projects</p>
            <Heading className="section__title">Built to solve real problems.</Heading>
            <p className="page-heading__lede">
              A portfolio of embedded, web, AI, and public-health systems taken from idea to working product.
            </p>
          </div>
          {!loading && (
            <div className="page-heading__stat">
              <strong>{String(visibleProjects.length).padStart(2, '0')}</strong>
              <span>{featured ? "Selected builds" : "Projects"}</span>
            </div>
          )}
        </div>

        {error && <p className="projects__status" role="status">Showing saved projects while the live collection is unavailable.</p>}
        {loading ? (
          <div className="projects__grid" role="status" aria-label="Loading projects">
            {[0, 1, 2].map(item => <div key={item} className="project-skeleton"><div /><span /><span /></div>)}
          </div>
        ) : visibleProjects.length === 0 ? (
          <p className="projects__status">Projects will appear here soon. <Link to="/contact">Get in touch to discuss my work.</Link></p>
        ) : (
          <div className="projects__grid">
            {visibleProjects.map((p, index) => (
              <article key={p.id ?? p.name} className="project-card">
                <ProjectMedia project={p} />
                <div className="project-card__body">
                  <span className="project-card__number">Project {String(index + 1).padStart(2, '0')}</span>
                  <h3>{p.name}</h3>
                  <p>{p.description}</p>
                  {(p.role || p.problem || p.solution || p.outcome) && (
                    <details className="project-card__case">
                      <summary>Project details</summary>
                      <dl>{[['Role', p.role], ['Problem', p.problem], ['Approach', p.solution], ['Outcome', p.outcome]].filter(([, value]) => value).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
                    </details>
                  )}
                  <ul className="project-card__tech">
                    {(Array.isArray(p.tech) ? p.tech : []).map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
                <div className="project-card__links">
                  {p.live_url && (
                    <a href={p.live_url} target="_blank" rel="noreferrer">
                      <ExternalLinkIcon width={15} height={15} /> Live demo
                    </a>
                  )}
                  {p.github_url && (
                    <a href={p.github_url} target="_blank" rel="noreferrer">
                      <GitHubIcon width={15} height={15} /> Source code
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
        {featured && <div className="section-action"><Link className="btn btn--ghost" to="/projects">Explore all projects <span aria-hidden="true">→</span></Link></div>}
      </div>
    </section>
  )
}
