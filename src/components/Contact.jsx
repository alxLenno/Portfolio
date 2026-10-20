import { profile } from '../data'
import { GitHubIcon, LinkedInIcon, MailIcon, PhoneIcon } from './icons'

export default function Contact() {
  return (
    <section id="contact" className="section section--alt contact-page">
      <div className="section-inner">
        <div className="page-heading">
          <div>
            <p className="section__eyebrow">Contact</p>
            <h1 className="section__title">Let&rsquo;s build something useful.</h1>
            <p className="page-heading__lede">
              Open to roles and collaborations in embedded systems, IoT, and applied AI.
            </p>
          </div>
          <div className="contact__availability">
            <span /> Available for opportunities
          </div>
        </div>

        <div className="contact__panel">
          <div className="contact__panel-copy">
            <span>Start a conversation</span>
            <h3>Have a role, research idea, or product in mind?</h3>
            <p>Choose the channel that works best. I&rsquo;ll get back to you as soon as possible.</p>
          </div>
          <div className="contact__grid">
          <a className="contact__card" href={`mailto:${profile.email}`}>
            <MailIcon width={20} height={20} />
            <span>
              <strong>Email</strong>
              <em>{profile.email}</em>
            </span>
          </a>
          <a className="contact__card" href={`tel:${profile.phone.replace(/\s+/g, '')}`}>
            <PhoneIcon width={20} height={20} />
            <span>
              <strong>Phone</strong>
              <em>{profile.phone}</em>
            </span>
          </a>
          <a className="contact__card" href={profile.linkedin} target="_blank" rel="noreferrer">
            <LinkedInIcon width={20} height={20} />
            <span>
              <strong>LinkedIn</strong>
              <em>lennox-kahati</em>
            </span>
          </a>
          <a className="contact__card" href={profile.github} target="_blank" rel="noreferrer">
            <GitHubIcon width={20} height={20} />
            <span>
              <strong>GitHub</strong>
              <em>LennoxKK</em>
            </span>
          </a>
          </div>
        </div>
      </div>
    </section>
  )
}
