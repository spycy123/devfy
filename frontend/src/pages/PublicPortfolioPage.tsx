import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowUpRight,
  Code2,
  ExternalLink,
  Globe,
  LoaderCircle,
} from 'lucide-react'
import { API_URL } from '../lib/api'

interface PublicProject {
  title: string
  description: string
  techStack: string[]
  repositoryUrl: string | null
  demoUrl: string | null
  createdAt: string
}

interface PublicUser {
  name: string
  username: string
  bio: string | null
  skills: string[]
  githubUrl: string | null
  websiteUrl: string | null
  projects: PublicProject[]
}

function PublicPortfolioPage() {
  const { username } = useParams<{ username: string }>()
  const [user, setUser] = useState<PublicUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadPortfolio() {
      setLoading(true)
      setError('')
      setUser(null)

      try {
        const response = await fetch(
          `${API_URL}/public/${encodeURIComponent(username ?? '')}`,
        )
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Portofolio tidak ditemukan.')
        }

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

  if (loading) {
    return (
      <main className="public-state">
        <LoaderCircle className="loading-icon" size={32} />
        <p>Memuat portofolio...</p>
      </main>
    )
  }

  if (error || !user) {
    return (
      <main className="public-state">
        <div className="public-state-icon">
          <Code2 size={30} />
        </div>
        <h1>Portofolio tidak ditemukan</h1>
        <p>{error || 'Profil yang lu cari belum tersedia.'}</p>
        <Link className="public-back-link" to="/">
          <ArrowLeft size={16} /> Kembali ke Devfy
        </Link>
      </main>
    )
  }

  return (
    <main className="public-portfolio">
      <nav className="public-nav">
        <Link className="public-brand" to="/">
          <span className="public-brand-icon">
            <Code2 size={19} />
          </span>
          devfy<span className="public-brand-dot">.</span>
        </Link>

        <Link className="public-nav-link" to="/">
          Dibuat dengan Devfy <ArrowUpRight size={15} />
        </Link>
      </nav>

      <section className="public-hero">
        <div className="public-eyebrow">
          <span className="public-status-dot" />
          DEVELOPER PORTFOLIO
        </div>

        <h1>
          Halo, gw <span>{user.name}</span>
        </h1>

        <p className="public-username">@{user.username}</p>

        <p className="public-bio">
          {user.bio || 'Seorang developer yang sedang membangun sesuatu yang keren.'}
        </p>

        <div className="public-socials">
          {user.githubUrl && (
            <a
              className="public-social-link"
              href={user.githubUrl}
              target="_blank"
              rel="noreferrer"
            >
              <Code2 size={17} /> GitHub <ArrowUpRight size={14} />
            </a>
          )}

          {user.websiteUrl && (
            <a
              className="public-social-link"
              href={user.websiteUrl}
              target="_blank"
              rel="noreferrer"
            >
              <Globe size={17} /> Website <ArrowUpRight size={14} />
            </a>
          )}
        </div>
      </section>

      {user.skills.length > 0 && (
        <section className="public-section">
          <div className="public-section-heading">
            <span className="public-section-index">01</span>
            <h2>Skills & Technologies</h2>
          </div>

          <div className="public-skills">
            {user.skills.map((skill) => (
              <span className="public-skill" key={skill}>
                <Code2 size={14} /> {skill}
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
            <h3>Belum ada proyek</h3>
            <p>Proyek yang dipublikasikan akan muncul di sini.</p>
          </div>
        ) : (
          <div className="public-project-grid">
            {user.projects.map((project, index) => (
              <article className="public-project-card" key={`${project.title}-${index}`}>
                <div className="public-project-top">
                  <span className="public-project-number">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <Code2 size={20} />
                </div>

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
                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Live Demo <ArrowUpRight size={15} />
                    </a>
                  )}

                  {project.repositoryUrl && (
                    <a
                      href={project.repositoryUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Source Code <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="public-footer">
        <span>© {new Date().getFullYear()} {user.name}</span>
        <span>Built with <strong>devfy.</strong></span>
      </footer>
    </main>
  )
}

export default PublicPortfolioPage
