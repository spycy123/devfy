import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Code2, LoaderCircle, Mail } from 'lucide-react'
import { apiRequest } from '../lib/api'
import { ParallaxBackdrop, TiltCard } from '../components/parallax'

export default function PasswordRecoveryPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const result = await apiRequest<{ message: string }>('/auth/password/forgot', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
      setMessage(result.message)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal meminta reset password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <ParallaxBackdrop variant="auth" />

      <Link to="/login" className="auth-back" style={{ position: 'relative', zIndex: 2 }}>
        <ArrowLeft size={16} /> Kembali ke login
      </Link>
      <TiltCard as="section" className="auth-card" maxTilt={3.5} glare={true} style={{ zIndex: 2 }}>
        <Link to="/" className="brand auth-brand">
          <span className="brand-mark"><Code2 size={21} /></span>
          <span>devfy<span className="brand-dot">.</span></span>
        </Link>
        <div className="auth-icon"><Mail size={22} /></div>
        <h1>Lupa password?</h1>
        <p className="auth-description">
          Masukkan email akunmu. Kami akan mengirim tautan untuk membuat password baru.
        </p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="recovery-email">EMAIL</label>
          <input
            id="recovery-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="nama@email.com"
            required
          />
          {error && <p role="alert" className="auth-error">{error}</p>}
          {message && <p role="status" className="auth-success">{message}</p>}
          <button className="button button-primary auth-submit" type="submit" disabled={loading}>
            {loading ? (
              <><LoaderCircle className="loading-spinner" size={17} /> Mengirim...</>
            ) : (
              <>Kirim tautan reset <ArrowRight size={17} /></>
            )}
          </button>
        </form>
        <p className="auth-switch">
          Ingat password? <Link to="/login">Masuk</Link>
        </p>
      </TiltCard>
    </main>
  )
}
