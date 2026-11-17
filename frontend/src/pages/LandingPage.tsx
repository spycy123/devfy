import { useState } from 'react'
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Check,
  Code2,
  Copy,
  FileCode,
  Globe,
  Layers3,
  Menu,
  Sparkles,
  Terminal,
  X,
} from 'lucide-react'
import {
  ParallaxBackdrop,
  ParallaxContainer,
  ParallaxLayer,
  TiltCard,
} from '../components/parallax'
import '../App.css'

const features = [
  {
    number: '01',
    icon: Code2,
    badge: 'IDENTITY',
    title: 'Your developer profile',
    description:
      'Tell your story, show your skills, and make it easy for recruiters and collaborators to know what you build.',
  },
  {
    number: '02',
    icon: Layers3,
    badge: 'SHOWCASE',
    title: 'Projects that matter',
    description:
      'Collect your best work in one place, complete with your tech stack, live demos, and GitHub repository links.',
  },
  {
    number: '03',
    icon: Globe,
    badge: 'SHARE',
    title: 'One link. Your portfolio.',
    description:
      'Publish a fast, responsive, and recruiter-ready portfolio at devfy.io/u/:username in seconds.',
  },
]

const steps = [
  {
    title: 'Create your developer profile',
    description: 'Set up your bio, skills tags, location, and social links in under 2 minutes.',
  },
  {
    title: 'Add projects you are proud of',
    description: 'Document your tech stack, upload screenshots, and connect your live demo and GitHub repo.',
  },
  {
    title: 'Publish and share with the world',
    description: 'Toggle your portfolio to public and drop your custom link on your resume and LinkedIn.',
  },
]

type ActiveTab = 'ts' | 'json' | 'preview'

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [activeTab, setActiveTab] = useState<ActiveTab>('ts')
  const [copied, setCopied] = useState(false)

  function closeMenu() {
    setMenuOpen(false)
  }

  function handleSubscribe(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!email.trim()) return

    window.location.href = `mailto:syafiinurradha@gmail.com?subject=${encodeURIComponent(
      'Hello Devfy',
    )}&body=${encodeURIComponent(`Hi, I am interested in Devfy.\nMy email: ${email}`)}`
  }

  function handleCopySnippet() {
    const snippet =
      activeTab === 'ts'
        ? `const developer: Developer = {\n  name: 'Alex Pratama',\n  role: 'Full Stack Engineer',\n  skills: ['React 19', 'TypeScript', 'Node.js', 'PostgreSQL'],\n  portfolio: 'https://devfy.io/u/alex'\n}`
        : JSON.stringify(
            {
              username: 'alex.dev',
              projects: [
                { title: 'Devfy Platform', status: 'PUBLISHED' },
                { title: 'Realtime AI Assistant', status: 'PUBLISHED' },
              ],
              verified: true,
            },
            null,
            2,
          )

    void navigator.clipboard.writeText(snippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="site-shell">
      <ParallaxBackdrop variant="landing" />
      <header className="navbar">
        <a
          className="brand"
          href="#home"
          onClick={closeMenu}
          aria-label="Devfy home"
        >
          <span className="brand-mark">
            <Code2 size={21} strokeWidth={2.5} />
          </span>
          <span>
            devfy<span className="brand-dot">.</span>
          </span>
        </a>

        <button
          className="mobile-menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <nav className={`nav-links ${menuOpen ? 'nav-links-open' : ''}`}>
          <a href="#features" onClick={closeMenu}>
            Features
          </a>
          <a href="#how-it-works" onClick={closeMenu}>
            How it works
          </a>
          <a href="#about" onClick={closeMenu}>
            About
          </a>

          <a href="/login" onClick={closeMenu}>
            Masuk
          </a>

          <a
            className="nav-cta"
            href="/register"
            onClick={closeMenu}
          >
            Daftar Gratis <ArrowUpRight size={15} />
          </a>
        </nav>
      </header>

      <main>
        <section className="hero section-container" id="home">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="status-dot" />
              <span>DEVFY CLI v2.4 • OPEN TO ALL DEVELOPERS</span>
            </div>

            <h1>
              Make your work
              <br />
              <span className="heading-accent">speak for itself.</span>
            </h1>

            <p className="hero-description">
              A home for everything you build. Bring your developer profile,
              projects, and portfolio together in one blazing fast, recruiter-ready place.
            </p>

            <div className="hero-actions">
              <a className="button button-primary" href="/register">
                Buat Portofolio Gratis <ArrowUpRight size={17} />
              </a>
              <a className="button button-secondary" href="#features">
                Explore Features <ArrowDownRight size={17} />
              </a>
            </div>

            <div className="hero-note">
              <span className="note-icon">
                <Check size={12} strokeWidth={3} />
              </span>
              <span>Built for students and aspiring engineers • 100% Free</span>
            </div>
          </div>

          <ParallaxContainer
            className="hero-visual"
            aria-label="Illustration of a developer portfolio"
          >
            <ParallaxLayer depth={-10} scrollSpeed={-0.06}>
              <div className="visual-glow" />
            </ParallaxLayer>

            <TiltCard className="code-window" maxTilt={5} glare={true} scale={1.01}>
              <div className="window-topbar">
                <div className="window-dots">
                  <i />
                  <i />
                  <i />
                </div>

                <div className="window-tabs">
                  <button
                    type="button"
                    className={`window-tab-btn ${activeTab === 'ts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('ts')}
                  >
                    <FileCode size={13} /> developer.ts
                  </button>
                  <button
                    type="button"
                    className={`window-tab-btn ${activeTab === 'json' ? 'active' : ''}`}
                    onClick={() => setActiveTab('json')}
                  >
                    <Terminal size={13} /> portfolio.json
                  </button>
                  <button
                    type="button"
                    className={`window-tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('preview')}
                  >
                    <Globe size={13} /> Preview ⚡
                  </button>
                </div>

                <button
                  type="button"
                  className={`window-copy-btn ${copied ? 'copied' : ''}`}
                  onClick={handleCopySnippet}
                  title="Copy code snippet"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="code-content">
                {activeTab === 'ts' && (
                  <>
                    <div className="code-line">
                      <span className="line-number">01</span>
                      <span>
                        <span className="code-purple">const</span> developer: Developer = {'{'}
                      </span>
                    </div>
                    <div className="code-line">
                      <span className="line-number">02</span>
                      <span className="indent">
                        <span className="code-blue">name</span>:{' '}
                        <span className="code-green">'Alex Pratama'</span>,
                      </span>
                    </div>
                    <div className="code-line">
                      <span className="line-number">03</span>
                      <span className="indent">
                        <span className="code-blue">role</span>:{' '}
                        <span className="code-green">'Full Stack Engineer'</span>,
                      </span>
                    </div>
                    <div className="code-line">
                      <span className="line-number">04</span>
                      <span className="indent">
                        <span className="code-blue">skills</span>: [
                        <span className="code-green">'React'</span>,{' '}
                        <span className="code-green">'TypeScript'</span>,{' '}
                        <span className="code-green">'Postgres'</span>],
                      </span>
                    </div>
                    <div className="code-line">
                      <span className="line-number">05</span>
                      <span className="indent">
                        <span className="code-blue">portfolio</span>:{' '}
                        <span className="code-amber">'https://devfy.io/u/alex'</span>,
                      </span>
                    </div>
                    <div className="code-line">
                      <span className="line-number">06</span>
                      <span className="indent">
                        <span className="code-blue">openToWork</span>:{' '}
                        <span className="code-purple">true</span>
                      </span>
                    </div>
                    <div className="code-line">
                      <span className="line-number">07</span>
                      <span>{'}'}</span>
                    </div>
                  </>
                )}

                {activeTab === 'json' && (
                  <>
                    <div className="code-line">
                      <span className="line-number">01</span>
                      <span>{'{'}</span>
                    </div>
                    <div className="code-line">
                      <span className="line-number">02</span>
                      <span className="indent">
                        <span className="code-blue">"username"</span>:{' '}
                        <span className="code-green">"alex.dev"</span>,
                      </span>
                    </div>
                    <div className="code-line">
                      <span className="line-number">03</span>
                      <span className="indent">
                        <span className="code-blue">"status"</span>:{' '}
                        <span className="code-green">"PUBLISHED"</span>,
                      </span>
                    </div>
                    <div className="code-line">
                      <span className="line-number">04</span>
                      <span className="indent">
                        <span className="code-blue">"projects"</span>: [{' '}
                        <span className="code-amber">"Devfy"</span>,{' '}
                        <span className="code-amber">"AI Assistant"</span> ],
                      </span>
                    </div>
                    <div className="code-line">
                      <span className="line-number">05</span>
                      <span className="indent">
                        <span className="code-blue">"verified"</span>:{' '}
                        <span className="code-purple">true</span>
                      </span>
                    </div>
                    <div className="code-line">
                      <span className="line-number">06</span>
                      <span>{'}'}</span>
                    </div>
                  </>
                )}

                {activeTab === 'preview' && (
                  <div className="window-preview-card">
                    <div className="window-preview-header">
                      <div className="window-preview-user">
                        <div className="window-preview-avatar">AP</div>
                        <div>
                          <strong style={{ display: 'block', fontSize: '13px', color: '#FFF' }}>
                            Alex Pratama
                          </strong>
                          <span style={{ fontSize: '11px', color: '#00F5A0', fontFamily: 'var(--font-mono)' }}>
                            @alex.dev
                          </span>
                        </div>
                      </div>
                      <span className="window-preview-badge">
                        <span className="status-dot" /> Open to work
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8' }}>
                      Building distributed web systems & modern UI with React & Node.js.
                    </p>
                    <div className="window-preview-projects">
                      <span className="window-preview-pill">✦ Devfy Platform</span>
                      <span className="window-preview-pill">✦ AI Assistant</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="window-footer">
                <span>
                  <span className="status-dot" /> All systems operational
                </span>
                <span>TypeScript 5.8 • devfy.io</span>
              </div>
            </TiltCard>

            <ParallaxLayer
              className="floating-card floating-card-profile"
              depth={20}
              scrollSpeed={-0.1}
              rotate={2}
            >
              <div className="avatar">AP</div>
              <div>
                <strong>Alex Pratama</strong>
                <span>@alex.dev • Active</span>
                <div className="mini-heat-grid">
                  <span className="heat-cell l1" />
                  <span className="heat-cell l2" />
                  <span className="heat-cell l3" />
                  <span className="heat-cell l2" />
                  <span className="heat-cell l1" />
                  <span className="heat-cell l3" />
                  <span className="heat-cell l2" />
                  <span className="heat-cell l3" />
                  <span className="heat-cell l1" />
                  <span className="heat-cell l2" />
                  <span className="heat-cell l3" />
                  <span className="heat-cell l2" />
                </div>
              </div>
              <Sparkles size={17} className="floating-sparkle" />
            </ParallaxLayer>

            <ParallaxLayer
              className="floating-card floating-card-stack"
              depth={-18}
              scrollSpeed={0.12}
              rotate={-2}
            >
              <span className="stack-icon">
                <Layers3 size={17} />
              </span>
              <div>
                <strong>Curated Stack</strong>
                <span>React 19 • TS • Postgres</span>
              </div>
            </ParallaxLayer>
          </ParallaxContainer>
        </section>

        <section className="features section-container" id="features">
          <div className="section-heading">
            <div>
              <div className="eyebrow">
                <span className="status-dot" /> WHAT IS DEVFY?
              </div>
              <h2>
                Everything you build.
                <br />
                <span className="heading-accent">One place to show it.</span>
              </h2>
            </div>
            <p>
              Your skills deserve more than a scattered collection of links and READMEs.
              Devfy gives your developer journey an authoritative, beautifully engineered showcase.
            </p>
          </div>

          <div className="feature-grid">
            {features.map(({ number, icon: Icon, badge, title, description }) => (
              <TiltCard as="article" className="feature-card" key={number} maxTilt={5} glare={true}>
                <div className="feature-card-top">
                  <span className="feature-icon">
                    <Icon size={21} />
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--accent)',
                      background: 'var(--accent-soft)',
                      padding: '2px 7px',
                      borderRadius: '4px',
                      fontWeight: 700,
                      letterSpacing: '0.06em'
                    }}>
                      {badge}
                    </span>
                    <span className="feature-number">{number}</span>
                  </div>
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
                <a href="#how-it-works" className="text-link">
                  Learn more <ArrowRight size={15} />
                </a>
              </TiltCard>
            ))}
          </div>
        </section>

        <section className="workflow" id="how-it-works">
          <div className="section-container workflow-inner">
            <div className="workflow-copy">
              <div className="eyebrow">
                <span className="status-dot" /> SIMPLE BY DESIGN
              </div>
              <h2>
                From idea
                <br />
                to <span className="heading-accent">your own space.</span>
              </h2>
              <p>
                Skip the weeks of building portfolio templates and debugging CSS. Focus on
                building extraordinary software — let Devfy present it with distinction.
              </p>
              <a className="button button-primary" href="/register">
                Mulai Sekarang <ArrowUpRight size={17} />
              </a>
            </div>

            <div className="workflow-steps">
              {steps.map((step, index) => (
                <TiltCard className="workflow-step" key={step.title} maxTilt={3} glare={false}>
                  <span className="step-number">0{index + 1}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </div>
                  <Check className="step-check" size={18} />
                </TiltCard>
              ))}
            </div>
          </div>
        </section>

        <section className="about section-container" id="about">
          <div className="about-symbol">
            <Code2 size={34} />
          </div>
          <div className="about-copy">
            <div className="eyebrow">
              <span className="status-dot" /> WHY DEVFY?
            </div>
            <h2>
              Built for the journey,
              <br />
              <span className="heading-accent">not just the destination.</span>
            </h2>
            <p>
              Every senior engineer was once a beginner debugging their first project.
              Devfy was designed specifically to help students and aspiring developers
              document their craft, build public proof of work, and stand out in job applications.
            </p>
          </div>
          <TiltCard className="about-aside" maxTilt={4} glare={true} scrollSpeed={-0.03}>
            <span className="aside-quote">&ldquo;</span>
            <p>
              Your next career breakthrough might start with something you shipped this weekend.
            </p>
            <span className="aside-signature">THE DEVFY MANIFESTO</span>
          </TiltCard>
        </section>

        <section className="contact section-container" id="contact">
          <TiltCard className="contact-panel" maxTilt={2.5} glare={false}>
            <div className="contact-copy">
              <div className="eyebrow">
                <span className="status-dot" /> HAVE A QUESTION?
              </div>
              <h2>
                Let&apos;s build
                <br />
                something <span className="heading-accent">meaningful.</span>
              </h2>
              <p>
                Have an idea, a feature request, or want to collaborate? Reach out
                directly to the founder.
              </p>
              <a
                className="button button-primary"
                href="mailto:syafiinurradha@gmail.com?subject=Hello%20Devfy"
              >
                Say hello <ArrowUpRight size={17} />
              </a>
            </div>

            <form className="contact-form" onSubmit={handleSubscribe}>
              <label htmlFor="contact-email">YOUR EMAIL ADDRESS</label>
              <input
                id="contact-email"
                type="email"
                placeholder="developer@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <button
                className="button button-primary form-submit"
                type="submit"
              >
                Connect with Devfy <ArrowUpRight size={17} />
              </button>
              <p>Opens your default mail client with a pre-filled subject.</p>
            </form>
          </TiltCard>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-inner section-container">
          <a className="brand footer-brand" href="#home">
            <span className="brand-mark">
              <Code2 size={19} strokeWidth={2.5} />
            </span>
            <span>
              devfy<span className="brand-dot">.</span>
            </span>
          </a>

          <p style={{ margin: 0, color: 'var(--muted)', fontSize: '14px' }}>
            Made with craft for developers everywhere.
          </p>

          <div className="footer-links">
            <a
              href="https://github.com/spycy123"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
            >
              <Code2 size={19} />
            </a>
            <a href="#home" aria-label="Back to top">
              <ArrowUpRight size={19} />
            </a>
          </div>
        </div>

        <div className="footer-bottom section-container">
          <span>
            © {new Date().getFullYear()} Devfy. All rights reserved.
          </span>
          <span>
            BUILD YOUR STORY <span className="brand-dot">●</span>
          </span>
        </div>
      </footer>
    </div>
  )
}
