import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { profile } from '../data'
import { DownloadIcon, MenuIcon, CloseIcon } from './icons'
import ThemeToggle from './ThemeToggle'

const links = [
  { to: '/about', label: 'About' },
  { to: '/research', label: 'Research' },
  { to: '/projects', label: 'Projects' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    const desktopQuery = window.matchMedia('(min-width: 1101px)')
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    const closeOnDesktop = (event) => {
      if (event.matches) setOpen(false)
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)
    desktopQuery.addEventListener('change', closeOnDesktop)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
      desktopQuery.removeEventListener('change', closeOnDesktop)
    }
  }, [open])

  return (
    <header
      className={`navbar ${scrolled ? 'navbar--scrolled' : ''} ${open ? 'navbar--menu-open' : ''}`}
    >
      <div className="navbar__inner">
        <Link to="/" className="navbar__brand" onClick={() => setOpen(false)}>
          <span className="navbar__mark">{profile.initials}</span>
          <span className="navbar__name">{profile.name}</span>
        </Link>

        <nav
          id="primary-navigation"
          aria-label="Primary navigation"
          className={`navbar__links ${open ? 'navbar__links--open' : ''}`}
        >
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => (isActive ? 'navbar__link--active' : undefined)}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </NavLink>
          ))}
          <a
            className="navbar__cta"
            href={profile.resume}
            target="_blank"
            rel="noreferrer"
            onClick={() => setOpen(false)}
          >
            <DownloadIcon width={15} height={15} />
            Résumé
          </a>
        </nav>

        <div className="navbar__actions">
          <ThemeToggle />
          <button
            type="button"
            className="navbar__toggle"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="primary-navigation"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <CloseIcon aria-hidden="true" /> : <MenuIcon aria-hidden="true" />}
          </button>
        </div>
      </div>
    </header>
  )
}
