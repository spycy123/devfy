import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Code2, LoaderCircle } from 'lucide-react'
import { apiRequest } from '../lib/api'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    setError('')
    if (password !== confirmation) {
      setError('Konfirmasi password belum sama.')
      return
    }
    setLoading(true)

    try {
      const result = await apiRequest<{ message: string }>('/auth/password/reset', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      })
      setMessage(result.message)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengatur ulang password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <Link to="/login" className="auth-back">
        <ArrowLeft size={16} /> Kembali ke login
      </Link>
      <section className="auth-card">
        <Link to="/" className="brand auth-brand">
          <span className="brand-mark"><Code2 size={21} /></span>
          <span>devfy<span className="brand-dot">.</span></span>
        </Link>
        <div className="eyebrow"><span className="status-dot" /> PEMULIHAN AKUN</div>
        <h1>Buat password <span className="heading-accent">baru.</span></h1>
        <p className="auth-description">
          Gunakan password 8–72 karakter yang belum pernah kamu bagikan.
        </p>
        {!token ? (
          <p role="alert" className="auth-error">
            Tautan reset tidak lengkap. Minta tautan baru terlebih dahulu.
          </p>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <label htmlFor="new-password">PASSWORD BARU</label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={72}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <label htmlFor="confirm-password">ULANGI PASSWORD</label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={72}
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              required
            />
            {error && <p role="alert" className="auth-error">{error}</p>}
            {message && <p role="status" className="auth-success">{message}</p>}
            <button
              className="button button-primary auth-submit"
              type="submit"
              disabled={loading || Boolean(message)}
            >
              {loading ? (
                <><LoaderCircle className="loading-spinner" size={17} /> Menyimpan...</>
              ) : (
                <>Simpan password <ArrowRight size={17} /></>
              )}
            </button>
          </form>
        )}
        <p className="auth-switch">
          Butuh tautan baru? <Link to="/forgot-password">Minta reset password</Link>
        </p>
      </section>
    </main>
  )
}
