
import { useState } from 'react'
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Check,
  Code2,
  Globe,
  Layers3,
  Menu,
  Sparkles,
  X,
} from 'lucide-react'
import '../App.css'

const features = [
  {
    number: '01',
    icon: Code2,
    title: 'Your developer profile',
    description:
      'Tell your story, show your skills, and make it easy for people to know what you do.',
  },
  {
    number: '02',
    icon: Layers3,
    title: 'Projects that matter',
    description:
      'Collect your best work in one place, complete with your tech stack and project links.',
  },
  {
    number: '03',
    icon: Globe,
    title: 'One link. Your portfolio.',
    description:
      'Publish a portfolio you can share with recruiters, collaborators, and the world.',
  },
]

const steps = [
  'Create your developer profile',
  'Add projects you are proud of',
  'Publish and share your portfolio',
]

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [email, setEmail] = useState('')

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

  return (
    <div className="site-shell">
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
              YOUR WORK, YOUR STORY
            </div>

            <h1>
              Make your work
              <br />
              <span className="heading-accent">speak for itself.</span>
            </h1>

            <p className="hero-description">
              A home for everything you build. Bring your developer profile,
              projects, and portfolio together in one simple place.
            </p>

            <div className="hero-actions">
              <a className="button button-primary" href="#features">
                Explore Devfy <ArrowUpRight size={17} />
              </a>
              <a className="button button-secondary" href="#how-it-works">
                How it works <ArrowDownRight size={17} />
              </a>
            </div>

            <div className="hero-note">
              <span className="note-icon">
                <Check size={14} />
              </span>
              Built for students and aspiring developers
            </div>
          </div>

          <div
            className="hero-visual"
            aria-label="Illustration of a developer portfolio"
          >
            <div className="visual-glow" />

            <div className="code-window">
              <div className="window-topbar">
                <div className="window-dots">
                  <i />
                  <i />
                  <i />
                </div>
                <span>developer.ts</span>
                <Code2 size={15} />
              </div>

              <div className="code-content">
                <div className="code-line">
                  <span className="line-number">01</span>
                  <span>
                    <span className="code-purple">const</span> developer = {'{'}
                  </span>
                </div>
                <div className="code-line">
                  <span className="line-number">02</span>
                  <span className="indent">
                    <span className="code-blue">name</span>:{' '}
                    <span className="code-green">'Your Name'</span>,
                  </span>
                </div>
                <div className="code-line">
                  <span className="line-number">03</span>
                  <span className="indent">
                    <span className="code-blue">role</span>:{' '}
                    <span className="code-green">'Developer'</span>,
                  </span>
                </div>
                <div className="code-line">
                  <span className="line-number">04</span>
                  <span className="indent">
                    <span className="code-blue">building</span>:{' '}
                    <span className="code-green">'Cool stuff'</span>,
                  </span>
                </div>
                <div className="code-line">
                  <span className="line-number">05</span>
                  <span className="indent">
                    <span className="code-blue">portfolio</span>:{' '}
                    <span className="code-green">true</span>,
                  </span>
                </div>
                <div className="code-line">
                  <span className="line-number">06</span>
                  <span>{'}'}</span>
                </div>
              </div>

              <div className="window-footer">
                <span>
                  <span className="status-dot" /> All systems ready
                </span>
                <span>TypeScript</span>
              </div>
            </div>

            <div className="floating-card floating-card-profile">
              <div className="avatar">D</div>
              <div>
                <strong>Your next chapter.</strong>
                <span>Developer portfolio</span>
              </div>
              <Sparkles size={17} className="floating-sparkle" />
            </div>

            <div className="floating-card floating-card-stack">
              <span className="stack-icon">
                <Layers3 size={17} />
              </span>
              <div>
                <strong>Your projects</strong>
                <span>One home for your work</span>
              </div>
            </div>

          </div>
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
              Your skills deserve more than a scattered collection of links.
              Devfy helps you bring your developer journey together.
            </p>
          </div>

          <div className="feature-grid">
            {features.map(({ number, icon: Icon, title, description }) => (
              <article className="feature-card" key={number}>
                <div className="feature-card-top">
                  <span className="feature-icon">
                    <Icon size={21} />
                  </span>
                  <span className="feature-number">{number}</span>
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
                <a href="#how-it-works" className="text-link">
                  Learn more <ArrowRight size={15} />
                </a>
              </article>
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
                No need to build a portfolio website from scratch. Focus on
                your work; let Devfy help you present it.
              </p>
              <a className="button button-primary" href="#contact">
                Let&apos;s connect <ArrowUpRight size={17} />
              </a>
            </div>

            <div className="workflow-steps">
              {steps.map((step, index) => (
                <div className="workflow-step" key={step}>
                  <span className="step-number">0{index + 1}</span>
                  <div>
                    <h3>{step}</h3>
                    <p>
                      {
                        [
                          'Set up your identity and developer links.',
                          'Show what you have learned and created.',
                          'Give your work a home on the web.',
                        ][index]
                      }
                    </p>
                  </div>
                  <Check className="step-check" size={18} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="about section-container" id="about">
          <div className="about-symbol">
            <Code2 size={36} />
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
              Every developer starts somewhere. Devfy is being built to help
              students and beginner developers document their progress,
              showcase their projects, and make their next opportunity easier
              to find.
            </p>
          </div>
          <div className="about-aside">
            <span className="aside-quote">&ldquo;</span>
            <p>
              Your next opportunity might start with something you built today.
            </p>
            <span className="aside-signature">THE DEVFY IDEA</span>
          </div>
        </section>

        <section className="contact section-container" id="contact">
          <div className="contact-panel">
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
                Have an idea, a suggestion, or just want to say hello? I&apos;d
                love to hear from you.
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
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <button
                className="button button-primary form-submit"
                type="submit"
              >
                Contact Devfy <ArrowUpRight size={17} />
              </button>
              <p>This opens your email app with a pre-filled message.</p>
            </form>
          </div>
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

          <p>Made for developers who are just getting started.</p>

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

export default App
