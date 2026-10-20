import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { profile } from '../data'
import { DownloadIcon, GitHubIcon, LinkedInIcon, MailIcon, PinIcon } from './icons'

const HeroScene = lazy(() => import('./HeroScene'))

export default function Hero() {
  return (
    <section id="top" className="hero">
      <div className="hero__glow" aria-hidden="true" />
      <div className="section-inner hero__inner">
        <div className="hero__content">
          <p className="hero__eyebrow">
            <span className="dot" /> Available for opportunities
          </p>
          <h1 className="hero__title">
            Hi, I&rsquo;m <span className="accent">{profile.name}</span>
          </h1>
          <p className="hero__role">{profile.title}</p>
          <p className="hero__tagline">{profile.tagline}</p>

          <div className="hero__meta">
            <span>
              <PinIcon width={15} height={15} /> {profile.location}
            </span>
          </div>

          <div className="hero__actions">
            <Link className="btn btn--primary" to="/projects">View projects <span aria-hidden="true">→</span></Link>
            <a
              className="btn btn--ghost"
              href={profile.resume}
              target="_blank"
              rel="noreferrer"
            >
              <DownloadIcon width={16} height={16} /> Download CV
            </a>
            <Link className="btn btn--ghost" to="/contact">
              Get in touch
            </Link>
          </div>

          <div className="hero__social">
            <a href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub">
              <GitHubIcon />
            </a>
            <a href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <LinkedInIcon />
            </a>
            <a href={`mailto:${profile.email}`} aria-label="Email">
              <MailIcon />
            </a>
          </div>
        </div>

        <Suspense
          fallback={
            <div className="hero-visual hero-visual--loading" aria-hidden="true">
              <span className="hero-visual__loader" />
            </div>
          }
        >
          <HeroScene />
        </Suspense>
      </div>
    </section>
  )
}
