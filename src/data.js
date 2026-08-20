export const profile = {
  name: 'Lennox Kahati',
  initials: 'LK',
  title: 'Electrical & Electronics Engineer',
  tagline:
    'Building embedded systems, IoT platforms, and AI-driven tools for healthcare and public health surveillance.',
  location: 'Nairobi, Kenya',
  email: 'lennoxkahati@gmail.com',
  phone: '+254 794 401700',
  github: 'https://github.com/LennoxKK',
  githubAlt: 'https://github.com/alxLenno',
  linkedin: 'https://www.linkedin.com/in/lennox-kahati-36ab94223',
  resume: '/Lennox_Kahati_CV.pdf',
  summary:
    'Electrical and Electronics Engineering graduate with training in embedded systems, control engineering, and IoT development. Experienced in microcontroller programming, system modeling, and hardware-software integration through academic projects and practical work. Strong analytical and problem-solving skills with an interest in developing reliable and scalable engineering solutions.',
}

export const experience = [
  {
    role: 'Research Assistant',
    org: 'University of Nairobi',
    location: 'Nairobi, Kenya',
    period: 'Nov 2024 — Present',
    points: [
      'Research on climate-linked disease surveillance using inclusive IVR systems',
      'Designed IVR workflows for real-time public health data collection',
      'Integrated APIs for automated data ingestion into analytics dashboards',
      'Co-authored and presented paper: "Bridging Climate Change and Public Health: An Inclusive IVR Framework for Disease Surveillance" at ACDSA 2026, Boracay Island, Philippines',
      'Currently involved in PCB design research',
    ],
  },
  {
    role: 'Quality Assurance Engineer',
    org: 'Transsion Kenya',
    location: 'Nairobi, Kenya',
    period: 'Jun 2024 — Nov 2025',
    points: [
      'Performed functional and regression testing on TECNO, Infinix and Itel smartphones',
      'Identified firmware, network and hardware defects',
      'Collaborated with engineering teams to improve device reliability',
    ],
  },
  {
    role: 'Embedded Systems Developer',
    org: 'iLab Africa',
    location: 'Nairobi, Kenya',
    period: 'Aug 2023 — Nov 2024',
    points: [
      'Engineered MQTT and MySQL based server architecture',
      'Developed embedded IoT solutions for sensor data acquisition',
    ],
  },
]

// Used until Supabase is configured (see src/lib/supabaseClient.js), and as
// the seed data loaded into the projects table by scripts/seed.mjs.
export const fallbackProjects = [
  {
    name: 'AQMRG — Air Quality Monitoring System',
    description:
      'Embedded air-quality monitoring system built around environmental sensors, with a centralized dashboard for real-time data visualization and analysis.',
    tech: ['React', 'Python', 'Embedded Sensors'],
    live_url: 'https://aqmrg-frontend.vercel.app/',
    github_url: 'https://github.com/alxLenno/aqmrg-frontend',
    image_url: '/projects/aqmrg.png',
    video_url: null,
    sort_order: 1,
  },
  {
    name: 'Climate-Linked Disease Surveillance IVR',
    description:
      'A mobile app for voice-based public health data collection, supporting English and Yoruba (Yoruba still in development). Collected data is sent to a cloud dashboard via API for processing and analysis. Presented at ACDSA 2026.',
    tech: ['Flask', 'Mobile App', 'REST APIs'],
    live_url: null,
    github_url: 'https://github.com/alxLenno/IVR_FLASK',
    image_url: null,
    video_url: null,
    sort_order: 2,
  },
  {
    name: 'CBR Challenger',
    description:
      'A reading-progress companion that securely backs up study cards to the cloud and syncs them across devices, with Google sign-in for returning users.',
    tech: ['JavaScript', 'Python', 'OAuth'],
    live_url: 'https://cbr.pythonanywhere.com/',
    github_url: 'https://github.com/alxLenno/cbr-challenger-production',
    image_url: '/projects/cbr.png',
    video_url: null,
    sort_order: 3,
  },
  {
    name: 'AiNT βeta Yet',
    description:
      'A study & music platform combining audio streaming with scripture study tools — an intelligent notes editor with contextual lookups for verses, definitions, and quick reference.',
    tech: ['Python', 'JavaScript', 'Google Auth'],
    live_url: 'https://aityet.pythonanywhere.com/',
    github_url: null,
    image_url: '/projects/aityet.png',
    video_url: null,
    sort_order: 4,
  },
  {
    name: 'AI Healthcare Assistant Chatbot',
    description:
      'A WhatsApp-based LLM-powered chatbot delivering healthcare guidance in local languages, with a Python Flask backend connected via APIs.',
    tech: ['Python', 'Flask', 'LLMs', 'WhatsApp API'],
    live_url: null,
    github_url: 'https://github.com/LennoxKK/afretec_asr_tts_backend',
    image_url: null,
    video_url: null,
    sort_order: 5,
  },
]

export const skills = [
  {
    group: 'Programming',
    items: ['Python', 'JavaScript / TypeScript', 'C / C++', 'MATLAB'],
  },
  {
    group: 'Embedded & Automation',
    items: [
      'Embedded Systems Development',
      'Microcontroller Programming',
      'PLC Programming (Ladder Logic)',
      'PCB Design',
    ],
  },
  {
    group: 'AI & Data',
    items: ['Machine Learning Fundamentals', 'LLM-based Chatbots', 'ASR / TTS'],
  },
  {
    group: 'Web & Backend',
    items: ['Flask', 'React', 'MQTT', 'MySQL', 'REST APIs'],
  },
]

export const education = [
  {
    degree: 'B.Sc. Electrical and Electronics Engineering',
    school: 'University of Nairobi',
    location: 'Nairobi, Kenya',
    period: '2019 — 2024',
    detail: 'Second Class Honours (Upper Division)',
  },
  {
    degree: 'KCSE',
    school: 'Lenana School',
    location: 'Kenya',
    period: '2015 — 2018',
    detail: 'Grade: A-',
  },
]

export const certifications = [
  {
    name: 'ACDSA 2026 — Oral Presentation',
    issuer: 'IEEE / Antalya Bilim University — Boracay Island, Philippines, Feb 2026',
    link: '/certs/ACDSA-2026-Certificate.pdf',
  },
  {
    name: 'Intro to Machine Learning',
    issuer: 'Kaggle',
    link: 'https://www.kaggle.com/learn/certification/lennoxkk/intro-to-machine-learning',
  },
  {
    name: 'IEEEXtreme 16.0 Programming Competition',
    issuer: 'IEEE — Participant, Oct 2022',
    link: '/certs/IEEEXtreme-16.0.pdf',
  },
  {
    name: 'IEEEXtreme 15.0 Programming Competition',
    issuer: 'IEEE — Participant, Oct 2021',
    link: '/certs/IEEEXtreme-15.0.pdf',
  },
]

// Used until Supabase is configured, and as the seed data loaded into the
// research_papers table by scripts/seed.mjs.
export const fallbackPapers = [
  {
    title:
      'Bridging Climate Change and Public Health: An Inclusive IVR Framework for Disease Surveillance',
    venue:
      'International Conference on Artificial Intelligence, Computer, Data Sciences and Applications (ACDSA 2026), Boracay Island, Philippines',
    status: 'Published',
    date_label: 'Feb 2026',
    authors: 'Segera, Lennox Kahati, Bradley Odimas, Ben Tito',
    abstract:
      'There is an increase in climate change illnesses such as malaria, cholera, and heat-stress in Kenya and Nigeria, yet so many districts encounter problems in data collection such as: relying on paper logs which reach the public-health offices weeks later, time consuming and costly physical visits. We co-designed an Interactive Voice Response (IVR) system (based on English) that works on any smart-feature phone. Using a mixed-method approach informed by the Unified Theory of Acceptance and Use of Technology (UTAUT), we conducted surveys and interviews in Ilaje-Bariga, Lagos. A six-week pilot in North-Central Nigeria (January to April 2025) generated 5660 IVR responses, plus 123 in-person interviews with health workers, patients, and caregivers. Participants were recruited through a purpose-convenience sampling and had to be residents of Ilaje-Bariga aged 18 years and above with healthcare or caregiving experience; those who did not provide consent were excluded. Most (95.1%) had at least secondary education, providing a diverse but locally representative sample of those who can use the english-based version of the IVR. The pilot collected 5,660 clean records. The Task Completion Rate (TCR) was 80.2% and the Not Completing Rate (NCR) 19.8%, with only 691 records needing retries, indicating low errors and latency. A lightweight (native that does not need cloud processing through API (Application Programming Interface) IVR can cut disease-reporting delays from weeks to hours. Next steps include DHIS2 integration and cost-effectiveness testing across Nigerian states.',
    paper_url: 'https://ieeexplore.ieee.org/document/11467974',
    sort_order: 1,
  },
]

// Used until Supabase is configured, and as the seed data loaded into the
// books table by scripts/seed.mjs.
export const fallbackBooks = []

export const leadership = {
  role: 'Chairperson, Robotics and Automation Society (IEEE UoN)',
}
