import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Code2,
  Copy,
  ExternalLink,
  Globe,
  LoaderCircle,
  MapPin,
} from 'lucide-react'
import { apiRequest } from '../lib/api'
import {
  ParallaxBackdrop,
  ParallaxContainer,
  ParallaxLayer,
} from '../components/parallax'
import { ScrollWordTitle, MotionCard } from '../components/animation'

interface PublicProject {
  title: string
  slug: string
  description: string
  techStack: string[]
  thumbnailUrl: string | null
  repositoryUrl: string | null
  demoUrl: string | null
  createdAt: string
}

interface PublicUser {
  name: string
  username: string
  bio: string | null
  skills: string[]
  avatarUrl: string | null
  location: string | null
  githubUrl: string | null
  linkedinUrl: string | null
  websiteUrl: string | null
  projects: PublicProject[]
}

function PublicPortfolioPage() {
  const { username } = useParams<{ username: string }>()
  const [user, setUser] = useState<PublicUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let active = true

    async function loadPortfolio() {
      setLoading(true)
      setError('')
      setUser(null)

      try {
        const data = await apiRequest<{ user: PublicUser }>(
          `/public/${encodeURIComponent(username ?? '')}`,
        )

        if (active) setUser(data.user)
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Gagal memuat portofolio.',
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadPortfolio()

    return () => {
      active = false
    }
  }, [username])

  function handleCopyShareLink() {
    void navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <main className="public-state" role="status" aria-live="polite">
        <LoaderCircle className="loading-icon" size={32} />
        <p style={{ marginTop: '16px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
          Memuat portofolio developer...
        </p>
      </main>
    )
  }

  if (error || !user) {
    return (
      <main className="public-state">
        <div className="public-state-icon">
          <Code2 size={30} />
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Portofolio tidak ditemukan</h1>
        <p style={{ color: 'var(--muted)', maxWidth: '420px', lineHeight: 1.6 }}>
          {error || 'Profil yang kamu cari belum tersedia atau diset ke privat.'}
        </p>
        <Link className="public-back-link" to="/">
          <ArrowLeft size={16} /> Kembali ke Devfy
        </Link>
      </main>
    )
  }

  return (
    <main className="public-portfolio">
      <ParallaxBackdrop variant="portfolio" />
      <nav className="public-nav">
        <Link className="public-brand" to="/">
          <span className="public-brand-icon">
            <Code2 size={19} />
          </span>
          devfy<span className="public-brand-dot">.</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="public-nav-link"
            onClick={handleCopyShareLink}
            style={{ cursor: 'pointer' }}
          >
            {copied ? <Check size={14} color="#00F5A0" /> : <Copy size={14} />}
            <span>{copied ? 'Tersalin!' : 'Bagikan'}</span>
          </button>

          <Link className="public-nav-link" to="/">
            Dibuat dengan Devfy <ArrowUpRight size={14} />
          </Link>
        </div>
      </nav>

      <ParallaxContainer className="public-hero">
        <div className="public-eyebrow">
          <span className="public-status-dot" />
          <span>DEVELOPER PORTFOLIO</span>
        </div>

        {user.avatarUrl ? (
          <ParallaxLayer depth={12} scrollSpeed={-0.06}>
            <img className="public-avatar" src={user.avatarUrl} alt={user.name} />
          </ParallaxLayer>
        ) : (
          <div className="public-avatar public-avatar-placeholder">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}

        <ScrollWordTitle as="h1">
          Halo, gw <span>{user.name}</span>
        </ScrollWordTitle>

        <p className="public-username">@{user.username}</p>

        <p className="public-bio">
          {user.bio || 'Seorang software developer yang sedang membangun sesuatu yang bermanfaat.'}
        </p>

        {user.location && (
          <p className="public-location">
            <MapPin size={15} color="var(--accent)" /> {user.location}
          </p>
        )}

        <div className="public-socials">
          {user.githubUrl && (
            <a
              className="public-social-link"
              href={user.githubUrl}
              target="_blank"
              rel="noreferrer"
            >
              <Code2 size={16} /> GitHub <ArrowUpRight size={14} />
            </a>
          )}

          {user.linkedinUrl && (
            <a
              className="public-social-link"
              href={user.linkedinUrl}
              target="_blank"
              rel="noreferrer"
            >
              <Globe size={16} /> LinkedIn <ArrowUpRight size={14} />
            </a>
          )}

          {user.websiteUrl && (
            <a
              className="public-social-link"
              href={user.websiteUrl}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink size={16} /> Website <ArrowUpRight size={14} />
            </a>
          )}
        </div>
      </ParallaxContainer>

      {user.skills.length > 0 && (
        <section className="public-section">
          <div className="public-section-heading">
            <span className="public-section-index">01</span>
            <h2>Skills & Technologies</h2>
          </div>

          <div className="public-skills">
            {user.skills.map((skill) => (
              <span className="public-skill" key={skill}>
                <Code2 size={13} color="var(--accent)" /> {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="public-section">
        <div className="public-section-heading">
          <span className="public-section-index">
            {user.skills.length > 0 ? '02' : '01'}
          </span>
          <h2>Selected Projects</h2>
          <span className="public-project-count">
            {String(user.projects.length).padStart(2, '0')} PROJECT
            {user.projects.length === 1 ? '' : 'S'}
          </span>
        </div>

        {user.projects.length === 0 ? (
          <div className="public-empty">
            <Code2 size={28} />
            <h3>Belum ada proyek publik</h3>
            <p>Proyek yang dipublikasikan oleh developer ini akan tampil di sini.</p>
          </div>
        ) : (
          <div className="public-project-grid">
            {user.projects.map((project, index) => (
              <MotionCard
                as="article"
                className="public-project-card"
                key={project.slug}
                delay={index * 0.1}
                hoverLift={6}
                hoverScale={1.018}
                glare={true}
              >
                <div className="public-project-top">
                  <span className="public-project-number">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <Code2 size={18} />
                </div>

                {project.thumbnailUrl && (
                  <img
                    className="public-project-thumbnail"
                    src={project.thumbnailUrl}
                    alt={`Thumbnail ${project.title}`}
                  />
                )}

                <h3>{project.title}</h3>
                <p className="public-project-description">
                  {project.description}
                </p>

                {project.techStack.length > 0 && (
                  <div className="public-project-tech">
                    {project.techStack.map((tech) => (
                      <span key={tech}>{tech}</span>
                    ))}
                  </div>
                )}

                <div className="public-project-links">
                  <Link
                    className="public-project-link"
                    to={`/u/${encodeURIComponent(user.username)}/projects/${encodeURIComponent(project.slug)}`}
                  >
                    Detail Proyek <ArrowUpRight size={14} />
                  </Link>

                  {project.demoUrl && (
                    <a
                      className="public-project-link"
                      href={project.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Demo <ArrowUpRight size={14} />
                    </a>
                  )}

                  {project.repositoryUrl && (
                    <a
                      className="public-project-link"
                      href={project.repositoryUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Source <ExternalLink size={13} />
                    </a>
                  )}
                </div>
              </MotionCard>
            ))}
          </div>
        )}
      </section>

      <footer className="footer" style={{ marginTop: '80px', borderTop: '1px solid var(--border)' }}>
        <div className="footer-bottom section-container" style={{ borderTop: 'none', paddingTop: 0 }}>
          <span>© {new Date().getFullYear()} {user.name}</span>
          <span>
            BUILT WITH <strong style={{ color: 'var(--accent)' }}>devfy.</strong>
          </span>
        </div>
      </footer>
    </main>
  )
}

export default PublicPortfolioPage
