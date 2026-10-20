import { NavLink } from 'react-router-dom'

const sections = [
  { to: '/about', label: 'About' },
  { to: '/experience', label: 'Experience' },
  { to: '/skills', label: 'Skills' },
  { to: '/education', label: 'Education' },
  { to: '/research', label: 'Research' },
  { to: '/books', label: 'Books' },
  { to: '/projects', label: 'Projects' },
  { to: '/contact', label: 'Contact' },
]

export default function PageTabs() {
  return (
    <section className="home-tabs" aria-labelledby="home-tabs-title">
      <div className="section-inner">
        <div className="home-tabs__meta">
          <h2 className="section__eyebrow" id="home-tabs-title">
            Explore
          </h2>
          <p className="home-tabs__hint">{String(sections.length).padStart(2, '0')} sections</p>
        </div>

        <nav className="home-tabs__bar" aria-label="Portfolio sections">
          {sections.map((section) => (
            <NavLink
              key={section.to}
              to={section.to}
              className={({ isActive }) =>
                isActive ? 'home-tabs__tab home-tabs__tab--active' : 'home-tabs__tab'
              }
            >
              {section.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </section>
  )
}
