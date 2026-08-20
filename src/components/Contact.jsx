import { profile } from '../data'
import { GitHubIcon, LinkedInIcon, MailIcon, PhoneIcon } from './icons'

export default function Contact() {
  return (
    <section id="contact" className="section section--alt">
      <div className="section-inner">
        <p className="section__eyebrow">Contact</p>
        <h2 className="section__title">Let&rsquo;s work together</h2>
        <p className="contact__lede">
          Open to roles and collaborations in embedded systems, IoT, and applied AI. Reach out
          through any of the channels below.
        </p>

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
    </section>
  )
}
