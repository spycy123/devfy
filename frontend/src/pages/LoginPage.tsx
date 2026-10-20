import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Code2, LoaderCircle } from 'lucide-react'
import { apiRequest } from '../lib/api'

interface LoginResponse {
  token: string
  user: {
    id: string
    name: string
    username: string
    email: string
  }
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await apiRequest<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })

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
          <span className="status-dot" /> SELAMAT DATANG KEMBALI
        </div>

        <h1>Senang melihatmu <span className="heading-accent">lagi.</span></h1>
        <p className="auth-description">
          Masuk ke akunmu dan lanjutkan membangun portofolio developer.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="login-email">EMAIL</label>
          <input
            id="login-email"
            type="email"
            placeholder="nama@email.com"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="login-password">PASSWORD</label>
          <input
            id="login-password"
            type="password"
            placeholder="Masukkan password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <div className="auth-password-help">
            <Link to="/forgot-password">Lupa password?</Link>
          </div>

          {error && (
            <p role="alert" className="auth-error">{error}</p>
          )}

          <button
            className="button button-primary auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <LoaderCircle className="loading-spinner" size={17} />
                Memproses...
              </>
            ) : 'Masuk ke akun'}
            {!loading && <ArrowRight size={17} />}
          </button>
        </form>

        <p className="auth-switch">
          Belum punya akun? <Link to="/register">Daftar sekarang</Link>
        </p>
      </section>
    </main>
  )
}
