import { skills } from '../data'

export default function Skills() {
  const skillCount = skills.reduce((total, group) => total + group.items.length, 0)

  return (
    <section id="skills" className="section section--alt skills-page">
      <div className="section-inner">
        <div className="page-heading">
          <div>
            <p className="section__eyebrow">Capabilities</p>
            <h1 className="section__title">A practical technical stack.</h1>
            <p className="page-heading__lede">
              Tools and disciplines used to move confidently between hardware, software, and intelligent systems.
            </p>
          </div>
          <div className="page-heading__stat">
            <strong>{String(skillCount).padStart(2, '0')}</strong>
            <span>Core capabilities</span>
          </div>
        </div>

        <div className="skills__grid">
          {skills.map((group, index) => (
            <div key={group.group} className="skills__group">
              <span className="skills__index">{String(index + 1).padStart(2, '0')}</span>
              <h3>{group.group}</h3>
              <ul>
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
