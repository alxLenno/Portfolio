import { education, certifications } from '../data'
import { BadgeIcon, ExternalLinkIcon } from './icons'

export default function Education() {
  return (
    <section id="education" className="section education-page">
      <div className="section-inner">
        <div className="page-heading">
          <div>
            <p className="section__eyebrow">Education &amp; credentials</p>
            <h1 className="section__title">A foundation for what comes next.</h1>
            <p className="page-heading__lede">
              Formal engineering education strengthened by ongoing technical learning and competition experience.
            </p>
          </div>
          <div className="page-heading__stat">
            <strong>{String(certifications.length).padStart(2, '0')}</strong>
            <span>Certifications</span>
          </div>
        </div>

        <div className="edu__grid">
          <div className="edu__column">
            <h3 className="edu__subhead">Education</h3>
            <div className="edu__list">
              {education.map((e, index) => (
                <div key={e.degree} className="edu__item">
                  <span className="edu__item-index">{String(index + 1).padStart(2, '0')}</span>
                  <div className="edu__item-head">
                    <h4>{e.degree}</h4>
                    <span>{e.period}</span>
                  </div>
                  <p className="edu__school">
                    {e.school} — {e.location}
                  </p>
                  <p className="edu__detail">{e.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="edu__column">
            <h3 className="edu__subhead">Certifications</h3>
            <div className="cert__list">
              {certifications.map((c) => (
                <a
                  key={c.name}
                  className="cert__item"
                  href={c.link}
                  target="_blank"
                  rel="noreferrer"
                >
                  <BadgeIcon width={20} height={20} />
                  <span className="cert__item-text">
                    <strong>{c.name}</strong>
                    <em>{c.issuer}</em>
                  </span>
                  <span className="cert__item-view">
                    View <ExternalLinkIcon width={14} height={14} />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
