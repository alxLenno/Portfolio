import { skills } from '../data'

export default function Skills() {
  return (
    <section id="skills" className="section section--alt">
      <div className="section-inner">
        <p className="section__eyebrow">Skills</p>
        <h2 className="section__title">What I work with</h2>

        <div className="skills__grid">
          {skills.map((group) => (
            <div key={group.group} className="skills__group">
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
