import { education, certifications } from '../data'
import { BadgeIcon, ExternalLinkIcon } from './icons'

export default function Education() {
  return (
    <section id="education" className="section">
      <div className="section-inner">
        <p className="section__eyebrow">Education & Certifications</p>
        <h2 className="section__title">Background</h2>

        <div className="edu__grid">
          <div>
            <h3 className="edu__subhead">Education</h3>
            <div className="edu__list">
              {education.map((e) => (
                <div key={e.degree} className="edu__item">
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

          <div>
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
