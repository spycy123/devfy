import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Code2 } from 'lucide-react'

const API_URL = 'http://localhost:5000/api'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Registrasi gagal.')
      }

      localStorage.setItem('devfy_token', data.token)
      localStorage.setItem('devfy_user', JSON.stringify(data.user))

      navigate('/dashboard')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Tidak dapat terhubung ke server.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <Link to="/" className="auth-back">
        <ArrowLeft size={16} /> Kembali ke beranda
      </Link>

      <section className="auth-card">
        <Link to="/" className="brand auth-brand">
          <span className="brand-mark">
            <Code2 size={21} />
          </span>
          <span>devfy<span className="brand-dot">.</span></span>
        </Link>

        <div className="eyebrow">
          <span className="status-dot" /> MULAI PERJALANANMU
        </div>

        <h1>Buat ruang untuk <span className="heading-accent">karyamu.</span></h1>
        <p className="auth-description">
          Buat akun Devfy dan kumpulkan proyekmu dalam satu portofolio.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="register-name">NAMA LENGKAP</label>
          <input
            id="register-name"
            type="text"
            placeholder="Nama kamu"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />

          <label htmlFor="register-username">USERNAME</label>
          <input
            id="register-username"
            type="text"
            placeholder="contoh: syafii_dev"
            autoComplete="username"
            pattern="[a-zA-Z0-9_]{3,30}"
            title="3–30 karakter, hanya huruf, angka, dan underscore."
            value={username}
            onChange={(event) => setUsername(event.target.value.toLowerCase())}
            required
          />

          <label htmlFor="register-email">EMAIL</label>
          <input
            id="register-email"
            type="email"
            placeholder="nama@email.com"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="register-password">PASSWORD</label>
          <input
            id="register-password"
            type="password"
            placeholder="Minimal 8 karakter"
            autoComplete="new-password"
            minLength={8}
            maxLength={72}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          {error && (
            <p role="alert" className="auth-error">{error}</p>
          )}

          <button
            className="button button-primary auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Membuat akun...' : 'Buat akun'}
            {!loading && <ArrowRight size={17} />}
          </button>
        </form>

        <p className="auth-switch">
          Sudah punya akun? <Link to="/login">Masuk</Link>
        </p>
      </section>
    </main>
  )
}
