import { Link } from 'react-router-dom'
import { profile } from '../data'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="section-inner footer__inner">
        <p>
          © {new Date().getFullYear()} {profile.name}. Built with React.
        </p>
        <Link to="/">Back home ↑</Link>
      </div>
    </footer>
  )
}
