import { profile, leadership } from '../data'

export default function About() {
  return (
    <section id="about" className="section">
      <div className="section-inner">
        <p className="section__eyebrow">About</p>
        <h2 className="section__title">Career summary</h2>
        <div className="about__grid">
          <p className="about__text">{profile.summary}</p>
          <div className="about__card">
            <p className="about__card-label">Leadership</p>
            <p className="about__card-value">{leadership.role}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
