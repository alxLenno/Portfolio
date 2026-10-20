import { experience } from '../data'

export default function Experience() {
  return (
    <section id="experience" className="section section--alt experience-page">
      <div className="section-inner">
        <div className="page-heading">
          <div>
            <p className="section__eyebrow">Experience</p>
            <h1 className="section__title">Work that builds forward.</h1>
            <p className="page-heading__lede">
              Experience spanning applied research, device quality, and embedded product development.
            </p>
          </div>
          <div className="page-heading__stat">
            <strong>{String(experience.length).padStart(2, '0')}</strong>
            <span>Professional roles</span>
          </div>
        </div>

        <div className="timeline">
          {experience.map((job, index) => (
            <article key={job.role + job.org} className="timeline__item">
              <div className="timeline__marker" />
              <div className="timeline__content">
                <span className="timeline__index">{String(index + 1).padStart(2, '0')}</span>
                <div className="timeline__head">
                  <h3>{job.role}</h3>
                  <span className="timeline__period">{job.period}</span>
                </div>
                <p className="timeline__org">
                  {job.org} — {job.location}
                </p>
                <ul className="timeline__points">
                  {job.points.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
