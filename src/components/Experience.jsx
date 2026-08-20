import { experience } from '../data'

export default function Experience() {
  return (
    <section id="experience" className="section section--alt">
      <div className="section-inner">
        <p className="section__eyebrow">Experience</p>
        <h2 className="section__title">Where I&rsquo;ve worked</h2>

        <div className="timeline">
          {experience.map((job) => (
            <article key={job.role + job.org} className="timeline__item">
              <div className="timeline__marker" />
              <div className="timeline__content">
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
