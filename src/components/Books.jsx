import { useBooks } from '../hooks/useBooks'
import { BookIcon, ExternalLinkIcon } from './icons'

export default function Books() {
  const { books, loading } = useBooks()

  return (
    <section id="books" className="section section--alt books-page">
      <div className="section-inner">
        <div className="books-page__header">
          <div>
            <p className="section__eyebrow">Published work</p>
            <h1 className="section__title">Ideas made tangible.</h1>
            <p className="books-page__lede">
              Writing on resilience, faith, technology, and the ideas that shape how we live.
            </p>
          </div>
          {!loading && books.length > 0 && (
            <div className="books-page__count" aria-label={`${books.length} published books`}>
              <strong>{String(books.length).padStart(2, '0')}</strong>
              <span>{books.length === 1 ? 'Published title' : 'Published titles'}</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="book-skeleton" aria-label="Loading books">
            <span className="book-skeleton__cover" />
            <span className="book-skeleton__copy" />
          </div>
        ) : books.length === 0 ? (
          <div className="books-page__empty">
            <BookIcon width={30} height={30} />
            <div>
              <h3>The next chapter is being written.</h3>
              <p>Published work will appear here soon.</p>
            </div>
          </div>
        ) : (
          <div className="book-grid">
            {books.map((b, index) => (
              <article
                key={b.id ?? b.title}
                className={`book-card ${index === 0 ? 'book-card--featured' : ''}`}
              >
                <div className="book-card__visual">
                  <span className="book-card__number" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="book-card__cover">
                    {b.cover_url ? (
                      <img src={b.cover_url} alt={`${b.title} cover`} loading="lazy" />
                    ) : (
                      <BookIcon width={42} height={42} />
                    )}
                  </div>
                </div>

                <div className="book-card__body">
                  <div className="book-card__meta">
                    {b.status && <span className="book-card__status">{b.status}</span>}
                    {b.year_label && <span>{b.year_label}</span>}
                  </div>
                  <p className="book-card__kicker">Book {String(index + 1).padStart(2, '0')}</p>
                  <h3>{b.title}</h3>
                  {b.authors && <p className="book-card__authors">By {b.authors}</p>}
                  {b.description && <p className="book-card__description">{b.description}</p>}
                  {b.link && (
                    <a className="book-card__cta" href={b.link} target="_blank" rel="noreferrer">
                      Read the book <ExternalLinkIcon width={15} height={15} />
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
