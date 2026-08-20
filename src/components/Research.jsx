import { useResearch } from '../hooks/useResearch'
import { DocumentIcon, ExternalLinkIcon } from './icons'

function statusClass(status) {
  const key = (status ?? '').toLowerCase().replace(/\s+/g, '-')
  return `paper-status paper-status--${key || 'default'}`
}

export default function Research() {
  const { papers, loading } = useResearch()

  if (!loading && papers.length === 0) return null

  return (
    <section id="research" className="section">
      <div className="section-inner">
        <p className="section__eyebrow">Research</p>
        <h2 className="section__title">Papers &amp; presentations</h2>

        {loading ? (
          <p className="projects__status">Loading papers…</p>
        ) : (
          <div className="paper-list">
            {papers.map((p) => (
              <article key={p.id ?? p.title} className="paper-card">
                <DocumentIcon className="paper-card__icon" width={22} height={22} />
                <div className="paper-card__body">
                  <div className="paper-card__head">
                    <h3>{p.title}</h3>
                    <span className={statusClass(p.status)}>{p.status}</span>
                  </div>
                  <p className="paper-card__venue">{p.venue}</p>
                  {p.authors && <p className="paper-card__authors">{p.authors}</p>}
                  {p.date_label && <p className="paper-card__date">{p.date_label}</p>}
                  {p.abstract && <p className="paper-card__abstract">{p.abstract}</p>}
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
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
