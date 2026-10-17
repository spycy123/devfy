
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowUpRight,
  Code2,
  FolderKanban,
  Globe,
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

const API_URL = 'http://localhost:5000/api'

interface UserProfile {
  id: string
  name: string
  username: string
  email: string
  bio: string | null
  skills: string[]
  githubUrl: string | null
  websiteUrl: string | null
  _count?: { projects: number }
}

interface Project {
  id: string
  title: string
  description: string
  techStack: string[]
  repositoryUrl: string | null
  demoUrl: string | null
  createdAt: string
}

interface ProjectForm {
  title: string
  description: string
  techStack: string
  repositoryUrl: string
  demoUrl: string
}

const emptyProjectForm: ProjectForm = {
  title: '',
  description: '',
  techStack: '',
  repositoryUrl: '',
  demoUrl: '',
}

export default function DashboardPage() {
  const navigate = useNavigate()

  const [user, setUser] = useState<UserProfile | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)
  const [editingProfile, setEditingProfile] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [projectForm, setProjectForm] =
    useState<ProjectForm>(emptyProjectForm)
  const [profileForm, setProfileForm] = useState({
    name: '',
    bio: '',
    skills: '',
    githubUrl: '',
    websiteUrl: '',
  })

  const token = localStorage.getItem('devfy_token')

  const logout = useCallback(() => {
    localStorage.removeItem('devfy_token')
    localStorage.removeItem('devfy_user')
    navigate('/login', { replace: true })
  }, [navigate])

  const request = useCallback(
    async (path: string, options: RequestInit = {}) => {
      const currentToken = localStorage.getItem('devfy_token')

      if (!currentToken) {
        logout()
        throw new Error('Sesi login tidak ditemukan.')
      }

      const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${currentToken}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      const data = await response.json().catch(() => ({}))

      if (response.status === 401) {
        logout()
        throw new Error('Sesi berakhir. Silakan login kembali.')
      }

      if (!response.ok) {
        throw new Error(data.message || 'Permintaan gagal diproses.')
      }

      return data
    },
    [logout],
  )

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const [profileData, projectData] = await Promise.all([
        request('/profile'),
        request('/projects'),
      ])

      const loadedUser = profileData.user as UserProfile

      setUser(loadedUser)
      setProjects(projectData.projects as Project[])
      setProfileForm({
        name: loadedUser.name || '',
        bio: loadedUser.bio || '',
        skills: (loadedUser.skills || []).join(', '),
        githubUrl: loadedUser.githubUrl || '',
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
          request('/profile'),
          request('/projects'),
        ])

        if (cancelled) return

        const loadedUser = profileData.user as UserProfile

        setUser(loadedUser)
        setProjects(projectData.projects as Project[])
        setProfileForm({
          name: loadedUser.name || '',
          bio: loadedUser.bio || '',
          skills: (loadedUser.skills || []).join(', '),
          githubUrl: loadedUser.githubUrl || '',
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
      repositoryUrl: project.repositoryUrl || '',
      demoUrl: project.demoUrl || '',
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
      repositoryUrl: projectForm.repositoryUrl.trim() || null,
      demoUrl: projectForm.demoUrl.trim() || null,
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
      const data = await request('/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          name: profileForm.name.trim(),
          bio: profileForm.bio,
          skills: profileForm.skills
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
          githubUrl: profileForm.githubUrl.trim() || null,
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
            <span className="dashboard-avatar">
              {user.name.charAt(0).toUpperCase()}
            </span>
            <div>
              <strong>{user.name}</strong>
              <span>@{user.username}</span>
            </div>
          </div>
        </header>

        {error && <p className="dashboard-alert dashboard-error">{error}</p>}
        {message && (
          <p className="dashboard-alert dashboard-success">{message}</p>
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
            <h3>Not published</h3>
            <span className="dashboard-stat-note">
              Fitur publikasi akan dibuat berikutnya
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

              <div className="project-form-actions">
                <button
                  className="button button-primary"
                  type="submit"
                  disabled={saving}
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
                    : editingProjectId
                      ? 'Save changes'
                      : 'Save project'}
                </button>

                <button
                  className="button button-secondary"
                  type="button"
                  onClick={handleCancelProjectForm}
                  disabled={saving}
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
                    bio: user.bio || '',
                    skills: (user.skills || []).join(', '),
                    githubUrl: user.githubUrl || '',
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
                disabled={saving}
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
                <div className="profile-avatar-large">
                  {user.name.trim().charAt(0).toUpperCase()}
                </div>

                <div className="profile-identity">
                  <h3>{user.name}</h3>
                  <span className="profile-username">@{user.username}</span>
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

              {(user.githubUrl || user.websiteUrl) && (
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
            Status portofolio: belum dipublikasikan. Fitur halaman publik
            akan kita bangun setelah dashboard selesai.
          </p>
        </section>

        <p className="dashboard-footer">DEVFY · YOUR WORK, YOUR STORY</p>
      </section>
    </main>
  )
}
