
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowUpRight,
  Code2,
  Eye,
  EyeOff,
  FolderKanban,
  Globe,
  MapPin,
  Plus,
  Settings,
  UserRound,
  Trash2,
  X,
  ExternalLink,
  LogOut,
  LoaderCircle,
  Save,
  Pencil,
} from 'lucide-react'
import { ApiError, apiRequest, uploadImage } from '../lib/api'

interface UserProfile {
  id: string
  name: string
  username: string
  email: string
  bio: string | null
  skills: string[]
  avatarUrl: string | null
  location: string | null
  githubUrl: string | null
  linkedinUrl: string | null
  websiteUrl: string | null
  portfolioPublished: boolean
  _count?: { projects: number }
}

interface Project {
  id: string
  title: string
  slug: string
  description: string
  techStack: string[]
  thumbnailUrl: string | null
  repositoryUrl: string | null
  demoUrl: string | null
  status: 'DRAFT' | 'PUBLISHED'
  moderationHidden: boolean
  createdAt: string
}

interface ProjectForm {
  title: string
  description: string
  techStack: string
  thumbnailUrl: string
  repositoryUrl: string
  demoUrl: string
  status: 'DRAFT' | 'PUBLISHED'
}

const emptyProjectForm: ProjectForm = {
  title: '',
  description: '',
  techStack: '',
  thumbnailUrl: '',
  repositoryUrl: '',
  demoUrl: '',
  status: 'DRAFT',
}

export default function DashboardPage() {
  const navigate = useNavigate()

  const [user, setUser] = useState<UserProfile | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)
  const [editingProfile, setEditingProfile] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [projectForm, setProjectForm] =
    useState<ProjectForm>(emptyProjectForm)
  const [profileForm, setProfileForm] = useState({
    name: '',
    username: '',
    bio: '',
    skills: '',
    avatarUrl: '',
    location: '',
    githubUrl: '',
    linkedinUrl: '',
    websiteUrl: '',
  })

  const token = localStorage.getItem('devfy_token')

  const logout = useCallback(() => {
    localStorage.removeItem('devfy_token')
    localStorage.removeItem('devfy_user')
    navigate('/login', { replace: true })
  }, [navigate])

  const request = useCallback(
    async <T,>(path: string, options: RequestInit = {}): Promise<T> => {
      const currentToken = localStorage.getItem('devfy_token')

      if (!currentToken) {
        logout()
        throw new Error('Sesi login tidak ditemukan.')
      }

      const headers = new Headers(options.headers)
      headers.set('Authorization', `Bearer ${currentToken}`)

      try {
        return await apiRequest<T>(path, { ...options, headers })
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          logout()
          throw new Error('Sesi berakhir. Silakan login kembali.', { cause: error })
        }
        throw error
      }
    },
    [logout],
  )

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const [profileData, projectData] = await Promise.all([
        request<{ user: UserProfile }>('/profile'),
        request<{ projects: Project[] }>('/projects'),
      ])

      const loadedUser = profileData.user

      setUser(loadedUser)
      setProjects(projectData.projects)
      setProfileForm({
        name: loadedUser.name || '',
        username: loadedUser.username || '',
        bio: loadedUser.bio || '',
        skills: (loadedUser.skills || []).join(', '),
        avatarUrl: loadedUser.avatarUrl || '',
        location: loadedUser.location || '',
        githubUrl: loadedUser.githubUrl || '',
        linkedinUrl: loadedUser.linkedinUrl || '',
        websiteUrl: loadedUser.websiteUrl || '',
      })
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Gagal memuat dashboard.',
      )
    } finally {
      setLoading(false)
    }
  }, [request])

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true })
      return
    }

    let cancelled = false

    async function initializeDashboard() {
      try {
        setLoading(true)
        setError('')

        const [profileData, projectData] = await Promise.all([
          request<{ user: UserProfile }>('/profile'),
          request<{ projects: Project[] }>('/projects'),
        ])

        if (cancelled) return

        const loadedUser = profileData.user

        setUser(loadedUser)
        setProjects(projectData.projects)
        setProfileForm({
          name: loadedUser.name || '',
          username: loadedUser.username || '',
          bio: loadedUser.bio || '',
          skills: (loadedUser.skills || []).join(', '),
          avatarUrl: loadedUser.avatarUrl || '',
          location: loadedUser.location || '',
          githubUrl: loadedUser.githubUrl || '',
          linkedinUrl: loadedUser.linkedinUrl || '',
          websiteUrl: loadedUser.websiteUrl || '',
        })
      } catch (err) {
        if (cancelled) return

        setError(
          err instanceof Error ? err.message : 'Gagal memuat dashboard.',
        )
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void initializeDashboard()

    return () => {
      cancelled = true
    }
  }, [token, navigate, request])

  function handleEditProject(project: Project) {
    setEditingProjectId(project.id)
    setProjectForm({
      title: project.title,
      description: project.description,
      techStack: project.techStack.join(', '),
      thumbnailUrl: project.thumbnailUrl || '',
      repositoryUrl: project.repositoryUrl || '',
      demoUrl: project.demoUrl || '',
      status: project.status,
    })
    setShowProjectForm(true)
    setError('')
    setMessage('')
  }

  function handleCancelProjectForm() {
    setShowProjectForm(false)
    setEditingProjectId(null)
    setProjectForm(emptyProjectForm)
    setError('')
    setMessage('')
  }

  async function handleAddProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    const payload = {
      title: projectForm.title.trim(),
      description: projectForm.description.trim(),
      techStack: projectForm.techStack
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      thumbnailUrl: projectForm.thumbnailUrl.trim() || null,
      repositoryUrl: projectForm.repositoryUrl.trim() || null,
      demoUrl: projectForm.demoUrl.trim() || null,
      status: projectForm.status,
    }

    try {
      if (editingProjectId) {
        await request(`/projects/${encodeURIComponent(editingProjectId)}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        })
        setMessage('Proyek berhasil diperbarui!')
      } else {
        await request('/projects', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        setMessage('Proyek berhasil ditambahkan!')
      }

      setProjectForm(emptyProjectForm)
      setEditingProjectId(null)
      setShowProjectForm(false)
      await loadDashboard()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Gagal menyimpan proyek.',
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleProjectImageUpload(file: File | undefined) {
    if (!file) return
    setUploadingImage(true)
    setError('')
    try {
      const thumbnailUrl = await uploadImage(file, 'projects')
      setProjectForm((current) => ({ ...current, thumbnailUrl }))
      setMessage('Thumbnail proyek berhasil diunggah.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengunggah gambar.')
    } finally {
      setUploadingImage(false)
    }
  }

  async function handleProfileImageUpload(file: File | undefined) {
    if (!file) return
    setUploadingImage(true)
    setError('')
    try {
      const avatarUrl = await uploadImage(file, 'avatars')
      setProfileForm((current) => ({ ...current, avatarUrl }))
      setMessage('Foto profil berhasil diunggah.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengunggah gambar.')
    } finally {
      setUploadingImage(false)
    }
  }

  async function handleProjectStatusChange(project: Project) {
    const status = project.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'
    setError('')
    setMessage('')
    try {
      await request(`/projects/${encodeURIComponent(project.id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      setProjects((current) =>
        current.map((item) => item.id === project.id ? { ...item, status } : item),
      )
      setMessage(
        status === 'PUBLISHED'
          ? 'Proyek berhasil dipublikasikan.'
          : 'Proyek dikembalikan ke draft.',
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengubah status proyek.')
    }
  }

  async function handlePortfolioStatusChange() {
    if (!user) return
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const portfolioPublished = !user.portfolioPublished
      const data = await request<{ user: UserProfile }>('/profile', {
        method: 'PATCH',
        body: JSON.stringify({ portfolioPublished }),
      })
      setUser((current) => current ? { ...current, ...data.user } : data.user)
      setMessage(
        portfolioPublished
          ? 'Portfolio berhasil dipublikasikan.'
          : 'Portfolio berhasil disembunyikan.',
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengubah status portfolio.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteProject(project: Project) {
    const confirmed = window.confirm(
      `Yakin ingin menghapus proyek "${project.title}"?`,
    )

    if (!confirmed) return

    setError('')
    setMessage('')

    try {
      await request(`/projects/${encodeURIComponent(project.id)}`, {
        method: 'DELETE',
      })

      setProjects((current) =>
        current.filter((item) => item.id !== project.id),
      )
      setMessage('Proyek berhasil dihapus.')

      if (editingProjectId === project.id) {
        handleCancelProjectForm()
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Gagal menghapus proyek.',
      )
    }
  }

  async function handleSaveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    try {
      const data = await request<{ user: UserProfile }>('/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          name: profileForm.name.trim(),
          username: profileForm.username.trim(),
          bio: profileForm.bio,
          skills: profileForm.skills
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
          avatarUrl: profileForm.avatarUrl.trim() || null,
          location: profileForm.location.trim() || null,
          githubUrl: profileForm.githubUrl.trim() || null,
          linkedinUrl: profileForm.linkedinUrl.trim() || null,
          websiteUrl: profileForm.websiteUrl.trim() || null,
        }),
      })

      setUser((current) =>
        current ? { ...current, ...data.user } : data.user,
      )
      setEditingProfile(false)
      setMessage('Profil berhasil diperbarui.')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Gagal menyimpan profil.',
      )
    } finally {
      setSaving(false)
    }
  }

  if (!token) return null

  if (loading) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-loading">
          <LoaderCircle className="loading-spinner" size={30} />
          <p>Memuat dashboard Devfy...</p>
        </div>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-loading">
          <Code2 size={34} />
          <h2>Dashboard belum bisa dimuat.</h2>
          {error && <p className="dashboard-error">{error}</p>}
          <button
            className="button button-primary"
            onClick={() => void loadDashboard()}
            type="button"
          >
            Coba lagi
          </button>
          <button
            className="button button-secondary"
            onClick={logout}
            type="button"
          >
            Kembali ke login
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="dashboard-page">
      <aside className="dashboard-sidebar">
        <Link to="/" className="brand">
          <span className="brand-mark"><Code2 size={21} /></span>
          <span>devfy<span className="brand-dot">.</span></span>
        </Link>

        <p className="dashboard-nav-label">WORKSPACE</p>
        <nav className="dashboard-mobile-nav" aria-label="Dashboard">
          <a className="dashboard-nav-item active" href="#overview">
            <FolderKanban size={17} /> Overview
          </a>
          <a className="dashboard-nav-item" href="#profile">
            <UserRound size={17} /> My profile
          </a>
          <a className="dashboard-nav-item" href="#projects">
            <Code2 size={17} /> My projects
          </a>
          <a className="dashboard-nav-item" href="#portfolio">
            <Globe size={17} /> Portfolio
          </a>
          <button
            className="dashboard-nav-item dashboard-mobile-logout"
            onClick={logout}
            type="button"
          >
            <LogOut size={17} /> Logout
          </button>
        </nav>

        <div className="dashboard-sidebar-bottom">
          <a className="dashboard-nav-item" href="#profile">
            <Settings size={17} /> Settings
          </a>
          <Link to="/" className="dashboard-back-home">
            <ArrowUpRight size={15} /> Back to website
          </Link>
          <button
            className="dashboard-nav-item dashboard-logout"
            onClick={logout}
            type="button"
          >
            <LogOut size={17} /> Logout
          </button>
        </div>
      </aside>

      <section className="dashboard-main" id="overview">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-date">YOUR DEVELOPER WORKSPACE</p>
            <h1>Dashboard<span className="brand-dot">.</span></h1>
          </div>
          <div className="dashboard-user">
            {user.avatarUrl ? (
              <img className="dashboard-avatar" src={user.avatarUrl} alt="" />
            ) : (
              <span className="dashboard-avatar">
                {user.name.charAt(0).toUpperCase()}
              </span>
            )}
            <div>
              <strong>{user.name}</strong>
            </div>
          </div>
        </header>

        {error && <p role="alert" className="dashboard-alert dashboard-error">{error}</p>}
        {message && (
          <p role="status" className="dashboard-alert dashboard-success">{message}</p>
        )}

        <section className="dashboard-welcome">
          <div>
            <span className="dashboard-welcome-tag">WELCOME TO DEVFY</span>
            <h2>
              Build something<br />
              <span className="heading-accent">worth sharing.</span>
            </h2>
            <p>
              Halo, {user.name}! Kelola profil, simpan proyek, dan siapkan
              portofolio developer kamu.
            </p>
            <a href="#profile" className="button button-primary">
              Set up your profile <ArrowUpRight size={16} />
            </a>
          </div>
          <div className="dashboard-welcome-icon">
            <Code2 size={76} strokeWidth={1.2} />
          </div>
        </section>

        <section className="dashboard-stats">
          <article className="dashboard-stat">
            <span className="dashboard-stat-icon"><UserRound size={18} /></span>
            <p>PROFILE STATUS</p>
            <h3>{user.bio?.trim() ? 'In progress' : 'Not complete'}</h3>
            <span className="dashboard-stat-note">
              {user.bio?.trim()
                ? 'Profil kamu sudah memiliki bio'
                : 'Tambahkan bio untuk melengkapi profil'}
            </span>
          </article>

          <article className="dashboard-stat">
            <span className="dashboard-stat-icon">
              <FolderKanban size={18} />
            </span>
            <p>YOUR PROJECTS</p>
            <h3>{projects.length} projects</h3>
            <span className="dashboard-stat-note">
              Proyek tersimpan di database
            </span>
          </article>

          <article className="dashboard-stat">
            <span className="dashboard-stat-icon"><Globe size={18} /></span>
            <p>PORTFOLIO</p>
            <h3>{user.portfolioPublished ? 'Published' : 'Unpublished'}</h3>
            <span className="dashboard-stat-note">
              {user.portfolioPublished
                ? `Portfolio aktif di /u/${user.username}`
                : 'Publikasikan setelah profil siap'}
            </span>
          </article>
        </section>

        <section className="dashboard-projects" id="projects">
          <div className="dashboard-section-title">
            <div>
              <h2>Your projects</h2>
              <p>Keep track of the things you build.</p>
            </div>
            <button
              className="button button-primary"
              type="button"
              onClick={() => {
                if (showProjectForm) {
                  handleCancelProjectForm()
                } else {
                  setEditingProjectId(null)
                  setProjectForm(emptyProjectForm)
                  setShowProjectForm(true)
                  setError('')
                  setMessage('')
                }
              }}
            >
              {showProjectForm ? <X size={16} /> : <Plus size={16} />}
              {showProjectForm ? 'Cancel' : 'Add project'}
            </button>
          </div>

          {showProjectForm && (
            <form className="dashboard-form" onSubmit={handleAddProject}>
              <h3>{editingProjectId ? 'Edit project' : 'Add a new project'}</h3>

              <label>
                Project title *
                <input
                  required
                  maxLength={120}
                  value={projectForm.title}
                  onChange={(event) =>
                    setProjectForm({
                      ...projectForm,
                      title: event.target.value,
                    })
                  }
                  placeholder="Contoh: Devfy Portfolio"
                />
              </label>

              <label>
                Description *
                <textarea
                  required
                  maxLength={5000}
                  rows={4}
                  value={projectForm.description}
                  onChange={(event) =>
                    setProjectForm({
                      ...projectForm,
                      description: event.target.value,
                    })
                  }
                  placeholder="Ceritakan tentang proyek ini..."
                />
              </label>

              <label>
                Tech stack
                <input
                  value={projectForm.techStack}
                  onChange={(event) =>
                    setProjectForm({
                      ...projectForm,
                      techStack: event.target.value,
                    })
                  }
                  placeholder="React, TypeScript, PostgreSQL"
                />
                <span className="form-hint">Pisahkan teknologi dengan koma.</span>
              </label>

              <label>
                Thumbnail
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) =>
                    void handleProjectImageUpload(event.target.files?.[0])
                  }
                  disabled={uploadingImage}
                />
                <span className="form-hint">
                  JPG, PNG, atau WebP hingga 5 MB. Upload memakai Cloudinary.
                </span>
                <input
                  type="url"
                  value={projectForm.thumbnailUrl}
                  onChange={(event) =>
                    setProjectForm({
                      ...projectForm,
                      thumbnailUrl: event.target.value,
                    })
                  }
                  placeholder="Atau tempel URL thumbnail"
                />
                {projectForm.thumbnailUrl && (
                  <img
                    className="form-image-preview"
                    src={projectForm.thumbnailUrl}
                    alt="Pratinjau thumbnail proyek"
                  />
                )}
              </label>

              <label>
                Repository URL
                <input
                  type="url"
                  value={projectForm.repositoryUrl}
                  onChange={(event) =>
                    setProjectForm({
                      ...projectForm,
                      repositoryUrl: event.target.value,
                    })
                  }
                  placeholder="https://github.com/username/project"
                />
              </label>

              <label>
                Live demo URL
                <input
                  type="url"
                  value={projectForm.demoUrl}
                  onChange={(event) =>
                    setProjectForm({
                      ...projectForm,
                      demoUrl: event.target.value,
                    })
                  }
                  placeholder="https://project.vercel.app"
                />
              </label>

              <label>
                Publication status
                <select
                  value={projectForm.status}
                  onChange={(event) =>
                    setProjectForm({
                      ...projectForm,
                      status: event.target.value === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
                    })
                  }
                >
                  <option value="DRAFT">Draft — hanya terlihat olehmu</option>
                  <option value="PUBLISHED">Published — tampil di portfolio</option>
                </select>
              </label>

              <div className="project-form-actions">
                <button
                  className="button button-primary"
                  type="submit"
                  disabled={saving || uploadingImage}
                >
                  {saving ? (
                    <LoaderCircle className="loading-spinner" size={16} />
                  ) : editingProjectId ? (
                    <Save size={16} />
                  ) : (
                    <Plus size={16} />
                  )}
                  {saving
                    ? 'Saving...'
                    : uploadingImage
                      ? 'Mengunggah gambar...'
                    : editingProjectId
                      ? 'Save changes'
                      : 'Save project'}
                </button>

                <button
                  className="button button-secondary"
                  type="button"
                  onClick={handleCancelProjectForm}
                  disabled={saving || uploadingImage}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {projects.length === 0 ? (
            <div className="dashboard-empty">
              <span className="empty-icon"><FolderKanban size={25} /></span>
              <h3>Your next project belongs here.</h3>
              <p>
                Kamu belum memiliki proyek. Klik Add project untuk
                menambahkan proyek pertamamu.
              </p>
            </div>
          ) : (
            <div className="dashboard-project-list">
              {projects.map((project) => (
                <article className="dashboard-project-card" key={project.id}>
                  <div className="project-card-heading">
                    <span className="empty-icon"><Code2 size={22} /></span>

                    <div className="project-card-actions">
                      <button
                        className="project-publish-button"
                        type="button"
                        title={project.moderationHidden
                          ? 'Disembunyikan oleh moderator'
                          : project.status === 'PUBLISHED' ? 'Unpublish project' : 'Publish project'}
                        aria-label={project.moderationHidden
                          ? `${project.title} disembunyikan oleh moderator`
                          : project.status === 'PUBLISHED' ? `Unpublish ${project.title}` : `Publish ${project.title}`}
                        onClick={() => void handleProjectStatusChange(project)}
                        disabled={project.moderationHidden}
                      >
                        {project.status === 'PUBLISHED'
                          ? <EyeOff size={16} />
                          : <Eye size={16} />}
                      </button>

                      <button
                        className="project-edit-button"
                        type="button"
                        title={`Edit ${project.title}`}
                        aria-label={`Edit ${project.title}`}
                        onClick={() => handleEditProject(project)}
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        className="project-delete-button"
                        type="button"
                        title={`Hapus ${project.title}`}
                        aria-label={`Hapus ${project.title}`}
                        onClick={() => void handleDeleteProject(project)}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>

                  {project.thumbnailUrl && (
                    <img
                      className="dashboard-project-thumbnail"
                      src={project.thumbnailUrl}
                      alt={`Thumbnail ${project.title}`}
                    />
                  )}

                  <span className={`project-status-badge ${project.moderationHidden ? 'moderated' : project.status === 'PUBLISHED' ? 'published' : 'draft'}`}>
                    {project.moderationHidden
                      ? 'Hidden by moderator'
                      : project.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                  </span>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>

                  {project.techStack.length > 0 && (
                    <div className="project-tech-stack">
                      {project.techStack.map((tech) => (
                        <span key={tech}>{tech}</span>
                      ))}
                    </div>
                  )}

                  <div className="project-card-links">
                    {project.status === 'PUBLISHED' && (
                      <Link
                        to={`/u/${encodeURIComponent(user.username)}/projects/${encodeURIComponent(project.slug)}`}
                      >
                        <Eye size={15} /> Preview
                      </Link>
                    )}
                    {project.repositoryUrl && (
                      <a
                        href={project.repositoryUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Code2 size={15} /> Repository
                      </a>
                    )}
                    {project.demoUrl && (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ExternalLink size={15} /> Live demo
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-checklist" id="profile">
          <div className="dashboard-section-title">
            <div>
              <h2>My profile</h2>
              <p>Informasi yang akan menjadi bagian dari portofoliomu.</p>
            </div>
            <button
              className="button button-secondary"
              type="button"
              onClick={() => {
                if (editingProfile) {
                  setProfileForm({
                    name: user.name || '',
                    username: user.username || '',
                    bio: user.bio || '',
                    skills: (user.skills || []).join(', '),
                    avatarUrl: user.avatarUrl || '',
                    location: user.location || '',
                    githubUrl: user.githubUrl || '',
                    linkedinUrl: user.linkedinUrl || '',
                    websiteUrl: user.websiteUrl || '',
                  })
                }
                setEditingProfile((current) => !current)
                setError('')
                setMessage('')
              }}
            >
              {editingProfile ? <X size={16} /> : <Settings size={16} />}
              {editingProfile ? 'Cancel' : 'Edit profile'}
            </button>
          </div>

          {editingProfile ? (
            <form className="dashboard-form" onSubmit={handleSaveProfile}>
              <label>
                Name *
                <input
                  required
                  maxLength={100}
                  value={profileForm.name}
                  onChange={(event) =>
                    setProfileForm({
                      ...profileForm,
                      name: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                Username *
                <input
                  required
                  minLength={3}
                  maxLength={30}
                  pattern="[a-zA-Z0-9_]{3,30}"
                  value={profileForm.username}
                  onChange={(event) =>
                    setProfileForm({
                      ...profileForm,
                      username: event.target.value.toLowerCase(),
                    })
                  }
                  aria-describedby="profile-username-hint"
                />
                <span id="profile-username-hint" className="form-hint">
                  3–30 huruf, angka, atau underscore. Perubahan username mengubah URL portfolio.
                </span>
              </label>

              <label>
                Profile photo
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) =>
                    void handleProfileImageUpload(event.target.files?.[0])
                  }
                  disabled={uploadingImage}
                />
                <span className="form-hint">JPG, PNG, atau WebP hingga 5 MB.</span>
                <input
                  type="url"
                  value={profileForm.avatarUrl}
                  onChange={(event) =>
                    setProfileForm({
                      ...profileForm,
                      avatarUrl: event.target.value,
                    })
                  }
                  placeholder="Atau tempel URL foto"
                />
                {profileForm.avatarUrl && (
                  <img
                    className="form-image-preview form-avatar-preview"
                    src={profileForm.avatarUrl}
                    alt="Pratinjau foto profil"
                  />
                )}
              </label>

              <label>
                Bio
                <textarea
                  rows={3}
                  maxLength={2000}
                  value={profileForm.bio}
                  onChange={(event) =>
                    setProfileForm({
                      ...profileForm,
                      bio: event.target.value,
                    })
                  }
                  placeholder="Ceritakan tentang dirimu..."
                />
              </label>

              <label>
                Skills
                <input
                  value={profileForm.skills}
                  onChange={(event) =>
                    setProfileForm({
                      ...profileForm,
                      skills: event.target.value,
                    })
                  }
                  placeholder="React, TypeScript, Node.js"
                />
                <span className="form-hint">Pisahkan skill dengan koma.</span>
              </label>

              <label>
                Location
                <input
                  maxLength={100}
                  value={profileForm.location}
                  onChange={(event) =>
                    setProfileForm({
                      ...profileForm,
                      location: event.target.value,
                    })
                  }
                  placeholder="Contoh: Jakarta, Indonesia"
                />
              </label>

              <label>
                GitHub URL
                <input
                  type="url"
                  value={profileForm.githubUrl}
                  onChange={(event) =>
                    setProfileForm({
                      ...profileForm,
                      githubUrl: event.target.value,
                    })
                  }
                  placeholder="https://github.com/username"
                />
              </label>

              <label>
                LinkedIn URL
                <input
                  type="url"
                  value={profileForm.linkedinUrl}
                  onChange={(event) =>
                    setProfileForm({
                      ...profileForm,
                      linkedinUrl: event.target.value,
                    })
                  }
                  placeholder="https://linkedin.com/in/username"
                />
              </label>

              <label>
                Website URL
                <input
                  type="url"
                  value={profileForm.websiteUrl}
                  onChange={(event) =>
                    setProfileForm({
                      ...profileForm,
                      websiteUrl: event.target.value,
                    })
                  }
                  placeholder="https://website.com"
                />
              </label>

              <button
                className="button button-primary"
                type="submit"
                disabled={saving || uploadingImage}
              >
                {saving ? (
                  <LoaderCircle className="loading-spinner" size={16} />
                ) : (
                  <Save size={16} />
                )}
                {saving ? 'Menyimpan...' : 'Save profile'}
              </button>
            </form>
          ) : (
            <div className="dashboard-profile-details">
              <div className="profile-card-header">
                {user.avatarUrl ? (
                  <img className="profile-avatar-large" src={user.avatarUrl} alt="" />
                ) : (
                  <div className="profile-avatar-large">
                    {user.name.trim().charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="profile-identity">
                  <h3>{user.name}</h3>
                  <p className="profile-username">@{user.username}</p>
                  <p className="profile-email">{user.email}</p>
                </div>
              </div>

              <div className="profile-bio-section">
                <h4>Tentang saya</h4>
                <p>
                  {user.bio ||
                    'Bio belum ditambahkan. Ceritakan sedikit tentang dirimu.'}
                </p>
              </div>

              {user.location && (
                <p className="profile-location">
                  <MapPin size={15} /> {user.location}
                </p>
              )}

              <div className="profile-skills-section">
                <h4>Keahlian</h4>
                {user.skills.length > 0 ? (
                  <div className="project-tech-stack">
                    {user.skills.map((skill) => (
                      <span key={skill}>{skill}</span>
                    ))}
                  </div>
                ) : (
                  <p className="profile-muted">
                    Belum ada keahlian yang ditambahkan.
                  </p>
                )}
              </div>

              {(user.githubUrl || user.linkedinUrl || user.websiteUrl) && (
                <div className="profile-links-section">
                  {user.githubUrl && (
                    <a
                      href={user.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Code2 size={16} /> GitHub <ExternalLink size={13} />
                    </a>
                  )}
                  {user.linkedinUrl && (
                    <a
                      href={user.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <UserRound size={16} /> LinkedIn <ExternalLink size={13} />
                    </a>
                  )}
                  {user.websiteUrl && (
                    <a
                      href={user.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Globe size={16} /> Website <ExternalLink size={13} />
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        <section className="dashboard-checklist" id="portfolio">
          <h2>Your portfolio</h2>
          <p>
            {user.portfolioPublished
              ? 'Portfolio kamu dapat dilihat publik. Hanya proyek berstatus Published yang akan tampil.'
              : 'Portfolio belum terlihat oleh pengunjung. Periksa profil dan proyek, lalu publikasikan saat siap.'}
          </p>

          <div className="portfolio-actions">
            {user.portfolioPublished && (
              <a
                className="portfolio-action portfolio-action-primary"
                href={`/u/${encodeURIComponent(user.username)}`}
                target="_blank"
                rel="noreferrer"
              >
                Preview Portfolio ↗
              </a>
            )}

            <button
              className="portfolio-action portfolio-action-secondary"
              type="button"
              disabled={saving}
              onClick={() => void handlePortfolioStatusChange()}
            >
              {user.portfolioPublished ? <EyeOff size={16} /> : <Eye size={16} />}
              {user.portfolioPublished ? 'Unpublish portfolio' : 'Publish portfolio'}
            </button>

            {user.portfolioPublished && (
              <button
                className="portfolio-action portfolio-action-secondary"
                type="button"
                onClick={async () => {
                  const link = `${window.location.origin}/u/${encodeURIComponent(user.username)}`
                  try {
                    await navigator.clipboard.writeText(link)
                    setMessage('Link portfolio berhasil disalin.')
                    setError('')
                  } catch {
                    window.prompt('Salin link portfolio ini:', link)
                  }
                }}
              >
                Copy Portfolio Link
              </button>
            )}
          </div>
        </section>

        <p className="dashboard-footer">DEVFY · YOUR WORK, YOUR STORY</p>
      </section>
    </main>
  )
}
