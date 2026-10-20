import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowUpRight,
  Code2,
  ExternalLink,
  LoaderCircle,
} from 'lucide-react'
import { apiRequest } from '../lib/api'

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

interface ProjectDetail {
  project: PublicProject
  author: { name: string; username: string }
}

export default function PublicProjectPage() {
  const { username, slug } = useParams<{ username: string; slug: string }>()
  const [data, setData] = useState<ProjectDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadProject() {
      setLoading(true)
      setError('')
      try {
        const result = await apiRequest<ProjectDetail>(
          `/public/${encodeURIComponent(username ?? '')}/projects/${encodeURIComponent(slug ?? '')}`,
        )
        if (active) setData(result)
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Gagal memuat proyek.')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadProject()
    return () => {
      active = false
    }
  }, [username, slug])

  if (loading) {
    return (
      <main className="public-state" role="status" aria-live="polite">
        <LoaderCircle className="loading-icon" size={32} />
        <p>Memuat detail proyek...</p>
      </main>
    )
  }

  if (error || !data) {
    return (
      <main className="public-state">
        <h1>Proyek tidak ditemukan</h1>
        <p>{error || 'Proyek ini tidak tersedia untuk publik.'}</p>
        <Link className="public-back-link" to={`/u/${encodeURIComponent(username ?? '')}`}>
          <ArrowLeft size={16} /> Kembali ke portfolio
        </Link>
      </main>
    )
  }

  const { project, author } = data

  return (
    <main className="public-portfolio public-project-detail">
      <nav className="public-nav">
        <Link className="public-brand" to={`/u/${encodeURIComponent(author.username)}`}>
          <span className="public-brand-icon"><Code2 size={19} /></span>
          {author.name}&apos;s portfolio
        </Link>
        <Link className="public-nav-link" to="/">
          Dibuat dengan Devfy <ArrowUpRight size={15} />
        </Link>
      </nav>

      <article className="project-detail-content">
        <Link className="public-back-link" to={`/u/${encodeURIComponent(author.username)}`}>
          <ArrowLeft size={16} /> Semua proyek
        </Link>
        {project.thumbnailUrl && (
          <img
            className="project-detail-image"
            src={project.thumbnailUrl}
            alt={`Thumbnail ${project.title}`}
          />
        )}
        <p className="public-eyebrow">
          <span className="public-status-dot" /> PROJECT BY @{author.username}
        </p>
        <h1>{project.title}</h1>
        <p className="project-detail-description">{project.description}</p>
        <div className="public-project-tech">
          {project.techStack.map((technology) => (
            <span key={technology}>{technology}</span>
          ))}
        </div>
        <div className="public-socials">
          {project.demoUrl && (
            <a className="public-social-link" href={project.demoUrl} target="_blank" rel="noreferrer">
              Live Demo <ArrowUpRight size={15} />
            </a>
          )}
          {project.repositoryUrl && (
            <a className="public-social-link" href={project.repositoryUrl} target="_blank" rel="noreferrer">
              Source Code <ExternalLink size={15} />
            </a>
          )}
        </div>
      </article>
    </main>
  )
}
