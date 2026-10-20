import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Experience from './components/Experience'
import Research from './components/Research'
import Books from './components/Books'
import Projects from './components/Projects'
import Skills from './components/Skills'
import Education from './components/Education'
import Contact from './components/Contact'
import Footer from './components/Footer'

const pageTitles = {
  '/': 'Lennox Kahati — Portfolio',
  '/about': 'About — Lennox Kahati',
  '/experience': 'Experience — Lennox Kahati',
  '/research': 'Research — Lennox Kahati',
  '/books': 'Books — Lennox Kahati',
  '/projects': 'Projects — Lennox Kahati',
  '/skills': 'Skills — Lennox Kahati',
  '/education': 'Education — Lennox Kahati',
  '/contact': 'Contact — Lennox Kahati',
}

function RouteEffects() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = pageTitles[pathname] ?? pageTitles['/']
  }, [pathname])

  return null
}

function SectionPage({ children }) {
  return <main className="page-route">{children}</main>
}

function App() {
  return (
    <>
      <RouteEffects />
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <main>
              <Hero />
            </main>
          }
        />
        <Route path="/about" element={<SectionPage><About /></SectionPage>} />
        <Route path="/experience" element={<SectionPage><Experience /></SectionPage>} />
        <Route path="/research" element={<SectionPage><Research /></SectionPage>} />
        <Route path="/books" element={<SectionPage><Books /></SectionPage>} />
        <Route path="/projects" element={<SectionPage><Projects /></SectionPage>} />
        <Route path="/skills" element={<SectionPage><Skills /></SectionPage>} />
        <Route path="/education" element={<SectionPage><Education /></SectionPage>} />
        <Route path="/contact" element={<SectionPage><Contact /></SectionPage>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </>
  )
}

export default App
