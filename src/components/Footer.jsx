import { profile } from '../data'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="section-inner footer__inner">
        <p>
          © {new Date().getFullYear()} {profile.name}. Built with React.
        </p>
        <a href="#top">Back to top ↑</a>
      </div>
    </footer>
  )
}
