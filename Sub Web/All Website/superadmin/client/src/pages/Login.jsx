import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import { Eye, EyeOff, Shield } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/overview')
    } catch (err) {
      setError(err.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="brand-mark" style={{ width: 48, height: 48, fontSize: 32 }}>S</div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--purple)' }}>SHOLOK</div>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '1.8px', color: 'var(--muted)', marginTop: 2 }}>CONTROL CENTER</div>
          </div>
        </div>

        <div className="login-header">
          <h1>Sign in to your account</h1>
          <p>Super Admin access only. Authorized personnel may proceed.</p>
        </div>

        {error && (
          <div className="login-error">
            <Shield size={14} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@sholok.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="form-field">
            <label htmlFor="password">Password</label>
            <div className="pw-wrap">
              <input
                id="password"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="pw-toggle"
                onClick={() => setShowPw(v => !v)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: 8, padding: '12px' }}
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', marginTop: 18 }}>
          This is a restricted system. All access is logged and audited.
        </p>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: grid;
          place-items: center;
          background: var(--canvas);
          padding: 24px 16px;
        }
        .login-card {
          width: min(420px, 100%);
          background: white;
          border: 1px solid var(--line);
          border-radius: 18px;
          padding: 36px 32px;
          box-shadow: var(--shadow);
        }
        .login-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 28px;
        }
        .login-header h1 {
          font-size: 22px;
          font-weight: 800;
          margin: 0 0 6px;
          letter-spacing: -0.4px;
        }
        .login-header p {
          font-size: 14px;
          color: var(--muted);
          margin: 0 0 22px;
        }
        .login-error {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 10px 12px;
          background: var(--red-soft);
          border: 1px solid #f5c6c4;
          border-radius: 8px;
          color: var(--red);
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 16px;
        }
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .pw-wrap {
          position: relative;
        }
        .pw-wrap input {
          width: 100%;
          padding-right: 40px;
        }
        .pw-toggle {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          border: 0;
          background: transparent;
          color: var(--muted);
          padding: 0;
          display: grid;
          place-items: center;
        }
        .auth-loading {
          min-height: 100vh;
          display: grid;
          place-items: center;
          background: var(--canvas);
        }
        .auth-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid var(--line);
          border-top-color: var(--purple);
          border-radius: 50%;
          animation: spin .8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
    </div>
  )
}
