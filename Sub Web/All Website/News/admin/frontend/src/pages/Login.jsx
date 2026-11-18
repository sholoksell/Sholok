import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import api from '../api';

const P = '#5D0096', A = '#D31710';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.login(email, password);
      login(res.user, res.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: `linear-gradient(135deg, #f5f0ff 0%, #fff0f0 100%)`, padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16, background: `linear-gradient(135deg, ${P}, ${A})`,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, marginBottom: 16,
          }}>📰</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: P, margin: 0 }}>SHOLOK</h1>
          <p style={{ color: '#666', fontSize: 14, margin: '4px 0 0' }}>News Admin Panel</p>
        </div>

        {/* Card */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: 32,
          boxShadow: '0 4px 24px rgba(93,0,150,0.1)',
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e', margin: '0 0 24px' }}>Sign In</h2>

          {error && (
            <div style={{ background: '#fff0f0', border: `1px solid ${A}`, borderRadius: 8, padding: '10px 14px', marginBottom: 20, color: A, fontSize: 14 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 6 }}>Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="admin@sholok.com"
                style={{
                  width: '100%', padding: '10px 14px', border: `1.5px solid #e0d6f5`, borderRadius: 8,
                  fontSize: 14, outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = P}
                onBlur={e => e.target.style.borderColor = '#e0d6f5'}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="••••••••"
                  style={{
                    width: '100%', padding: '10px 40px 10px 14px', border: `1.5px solid #e0d6f5`, borderRadius: 8,
                    fontSize: 14, outline: 'none', boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = P}
                  onBlur={e => e.target.style.borderColor = '#e0d6f5'}
                />
                <button type="button" onClick={() => setShowPw(v => !v)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#888',
                }}>
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '12px', background: loading ? '#b39ddb' : `linear-gradient(135deg, ${P}, #7b00c8)`,
              color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer', transition: 'opacity 0.2s',
            }}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: '#888', fontSize: 12, marginTop: 20 }}>
          © 2024 Sholok News · Authorized personnel only
        </p>
      </div>
    </div>
  );
}
