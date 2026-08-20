import { useBooks } from '../hooks/useBooks'
import { BookIcon, ExternalLinkIcon } from './icons'

export default function Books() {
  const { books, loading } = useBooks()

  return (
    <section id="books" className="section section--alt">
      <div className="section-inner">
        <p className="section__eyebrow">Books</p>
        <h2 className="section__title">Published books</h2>

        {loading ? (
          <p className="projects__status">Loading books…</p>
        ) : books.length === 0 ? (
          <p className="projects__status">Nothing published yet — check back soon.</p>
        ) : (
          <div className="book-grid">
            {books.map((b) => (
              <article key={b.id ?? b.title} className="book-card">
                <div className="book-card__cover">
                  {b.cover_url ? (
                    <img src={b.cover_url} alt={`${b.title} cover`} loading="lazy" />
                  ) : (
                    <BookIcon width={32} height={32} />
                  )}
                </div>
                <div className="book-card__body">
                  <div className="book-card__head">
                    <h3>{b.title}</h3>
                    {b.status && <span className="paper-status">{b.status}</span>}
                  </div>
                  {b.authors && <p className="paper-card__authors">{b.authors}</p>}
                  {b.year_label && <p className="paper-card__date">{b.year_label}</p>}
                  {b.description && <p className="book-card__description">{b.description}</p>}
                  {b.link && (
                    <a className="paper-card__view" href={b.link} target="_blank" rel="noreferrer">
                      Read book <ExternalLinkIcon width={14} height={14} />
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
