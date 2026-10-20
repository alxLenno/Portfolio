import { Link } from 'react-router-dom'
import { useResearch } from '../hooks/useResearch'
import { DocumentIcon, ExternalLinkIcon } from './icons'

function statusClass(status) {
  const key = (status ?? '').toLowerCase().replace(/\s+/g, '-')
  return `paper-status paper-status--${key || 'default'}`
}

export default function Research({ featured = false }) {
  const { papers, loading } = useResearch()

  const Heading = featured ? 'h2' : 'h1'
  const visiblePapers = featured ? papers.slice(0, 1) : papers

  return (
    <section id="research" className="section research-page">
      <div className="section-inner">
        <div className="page-heading">
          <div>
            <p className="section__eyebrow">Research</p>
            <Heading className="section__title">Evidence into impact.</Heading>
            <p className="page-heading__lede">
              Applied research across public health, inclusive technology, and data-driven systems.
            </p>
          </div>
          {!loading && (
            <div className="page-heading__stat">
              <strong>{String(papers.length).padStart(2, '0')}</strong>
              <span>Research outputs</span>
            </div>
          )}
        </div>

        {loading ? (
          <p className="projects__status">Loading papers…</p>
        ) : visiblePapers.length === 0 ? (
          <p className="projects__status">Research publications will appear here soon.</p>
        ) : (
          <div className="paper-list">
            {visiblePapers.map((p, index) => (
              <article key={p.id ?? p.title} className="paper-card">
                <div className="paper-card__rail">
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <DocumentIcon className="paper-card__icon" width={22} height={22} />
                </div>
                <div className="paper-card__body">
                  <div className="paper-card__head">
                    <h3>{p.title}</h3>
                    <span className={statusClass(p.status)}>{p.status}</span>
                  </div>
                  <p className="paper-card__venue">{p.venue}</p>
                  {p.authors && <p className="paper-card__authors">{p.authors}</p>}
                  {p.date_label && <p className="paper-card__date">{p.date_label}</p>}
                  {p.abstract && (
                    <details className="paper-card__abstract-wrap">
                      <summary>Read abstract</summary>
                      <p className="paper-card__abstract">{p.abstract}</p>
                    </details>
                  )}
                  <div className="paper-card__actions">
                    {p.paper_url && (
                      <a
                        className="paper-card__view"
                        href={p.paper_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View paper <ExternalLinkIcon width={14} height={14} />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
        {featured && <div className="section-action"><Link className="btn btn--ghost" to="/research">Explore research <span aria-hidden="true">→</span></Link></div>}
        {!featured && <div className="section-action"><Link to="/books">Explore books and writing →</Link></div>}
      </div>
    </section>
  )
}
