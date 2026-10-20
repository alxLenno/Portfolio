import { Link } from 'react-router-dom'
import { profile, leadership } from '../data'

export default function About() {
  return (
    <section id="about" className="section about-page">
      <div className="section-inner">
        <div className="page-heading">
          <div>
            <p className="section__eyebrow">About</p>
            <h1 className="section__title">Engineering with purpose.</h1>
            <p className="page-heading__lede">
              A multidisciplinary engineer working where hardware, software, and human needs meet.
            </p>
          </div>
          <div className="page-heading__stat">
            <strong>03</strong>
            <span>Core domains</span>
          </div>
        </div>

        <nav className="profile-links" aria-label="Explore my background">
          <Link to="/experience">Experience <span aria-hidden="true">↗</span></Link>
          <Link to="/skills">Skills <span aria-hidden="true">↗</span></Link>
          <Link to="/education">Education <span aria-hidden="true">↗</span></Link>
        </nav>
        <div className="about__grid">
          <div className="about__story">
            <span className="about__story-index">Profile / 01</span>
            <p className="about__text">{profile.summary}</p>
          </div>
          <div className="about__details">
            <div className="about__card">
              <p className="about__card-label">Discipline</p>
              <p className="about__card-value">{profile.title}</p>
            </div>
            <div className="about__card">
              <p className="about__card-label">Based in</p>
              <p className="about__card-value">{profile.location}</p>
            </div>
            <div className="about__card about__card--wide">
              <p className="about__card-label">Leadership</p>
              <p className="about__card-value">{leadership.role}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
