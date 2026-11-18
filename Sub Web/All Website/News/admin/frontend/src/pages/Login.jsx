import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import api from '../api';

const P = '#5D0096', A = '#D31710';

const inputStyle = (focused) => ({
  width: '100%', padding: '11px 14px', border: `1.5px solid ${focused ? P : '#e0d6f5'}`,
  borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.2s', background: '#faf8ff', color: '#1a1a2e',
});

function EyeIcon({ open }) {
  return open
    ? <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
    : <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'register'

  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regCode, setRegCode] = useState('');
  const [showRegPw, setShowRegPw] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Focus tracking
  const [focused, setFocused] = useState('');

  const switchMode = (m) => {
    setMode(m); setError(''); setSuccess('');
    setEmail(''); setPassword('');
    setRegName(''); setRegEmail(''); setRegPassword(''); setRegConfirm(''); setRegCode('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await api.login(email, password);
      login(res.user, res.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (regPassword !== regConfirm) { setError('Passwords do not match'); return; }
    if (regPassword.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      const res = await api.register(regName, regEmail, regPassword, regCode);
      login(res.user, res.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #f5f0ff 0%, #fff0f0 100%)', padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16, background: `linear-gradient(135deg, ${P}, ${A})`,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
          }}>
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="3" fill="white" fillOpacity="0.2"/>
              <rect x="6" y="7" width="12" height="1.5" rx="0.75" fill="white"/>
              <rect x="6" y="10.5" width="12" height="1.5" rx="0.75" fill="white"/>
              <rect x="6" y="14" width="8" height="1.5" rx="0.75" fill="white"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: P, margin: 0 }}>SHOLOK</h1>
          <p style={{ color: '#888', fontSize: 14, margin: '4px 0 0' }}>News Admin Panel</p>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: 'flex', background: '#ede8f8', borderRadius: 12, padding: 4, marginBottom: 16,
        }}>
          {['login', 'register'].map(m => (
            <button key={m} type="button" onClick={() => switchMode(m)} style={{
              flex: 1, padding: '9px 0', borderRadius: 9, border: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: 600, transition: 'all 0.2s',
              background: mode === m ? '#fff' : 'transparent',
              color: mode === m ? P : '#888',
              boxShadow: mode === m ? '0 2px 8px rgba(93,0,150,0.12)' : 'none',
            }}>
              {m === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        {/* Card */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: 32,
          boxShadow: '0 4px 24px rgba(93,0,150,0.1)',
        }}>
          {error && (
            <div style={{ background: '#fff0f0', border: `1px solid ${A}`, borderRadius: 8, padding: '10px 14px', marginBottom: 20, color: A, fontSize: 14 }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ background: '#f0fff4', border: '1px solid #22c55e', borderRadius: 8, padding: '10px 14px', marginBottom: 20, color: '#16a34a', fontSize: 14 }}>
              {success}
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} autoComplete="off">
              {/* hidden dummy fields to fool browser autofill */}
              <input type="text" name="fake_user" style={{ display: 'none' }} readOnly tabIndex={-1} />
              <input type="password" name="fake_pass" style={{ display: 'none' }} readOnly tabIndex={-1} />

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 6 }}>Email</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="Enter your email"
                  autoComplete="new-password"
                  style={inputStyle(focused === 'email')}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused('')}
                />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 6 }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                    placeholder="Enter your password"
                    autoComplete="new-password"
                    style={{ ...inputStyle(focused === 'pass'), paddingRight: 42 }}
                    onFocus={() => setFocused('pass')}
                    onBlur={() => setFocused('')}
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)} style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#888', display: 'flex', alignItems: 'center',
                  }}>
                    <EyeIcon open={showPw} />
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} style={{
                width: '100%', padding: 12, background: loading ? '#b39ddb' : `linear-gradient(135deg, ${P}, #7b00c8)`,
                color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}>
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} autoComplete="off">
              <input type="text" name="fake_user" style={{ display: 'none' }} readOnly tabIndex={-1} />
              <input type="password" name="fake_pass" style={{ display: 'none' }} readOnly tabIndex={-1} />

              {[
                { label: 'Full Name', val: regName, set: setRegName, type: 'text', key: 'rname', ph: 'Your full name' },
                { label: 'Email', val: regEmail, set: setRegEmail, type: 'email', key: 'remail', ph: 'Your email address' },
              ].map(({ label, val, set, type, key, ph }) => (
                <div key={key} style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 6 }}>{label}</label>
                  <input
                    type={type} value={val} onChange={e => set(e.target.value)} required
                    placeholder={ph} autoComplete="new-password"
                    style={inputStyle(focused === key)}
                    onFocus={() => setFocused(key)} onBlur={() => setFocused('')}
                  />
                </div>
              ))}

              {[
                { label: 'Password', val: regPassword, set: setRegPassword, show: showRegPw, toggle: () => setShowRegPw(v => !v), key: 'rpw', ph: 'Min. 8 characters' },
                { label: 'Confirm Password', val: regConfirm, set: setRegConfirm, show: showRegPw, toggle: null, key: 'rcpw', ph: 'Re-enter password' },
              ].map(({ label, val, set, show, toggle, key, ph }) => (
                <div key={key} style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 6 }}>{label}</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={show ? 'text' : 'password'} value={val} onChange={e => set(e.target.value)} required
                      placeholder={ph} autoComplete="new-password"
                      style={{ ...inputStyle(focused === key), paddingRight: toggle ? 42 : 14 }}
                      onFocus={() => setFocused(key)} onBlur={() => setFocused('')}
                    />
                    {toggle && (
                      <button type="button" onClick={toggle} style={{
                        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer', color: '#888', display: 'flex', alignItems: 'center',
                      }}>
                        <EyeIcon open={show} />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 6 }}>
                  Invite Code
                  <span style={{ fontWeight: 400, color: '#999', marginLeft: 6, fontSize: 12 }}>— provided by admin</span>
                </label>
                <input
                  type="text" value={regCode} onChange={e => setRegCode(e.target.value)} required
                  placeholder="Enter invite code"
                  autoComplete="off"
                  style={inputStyle(focused === 'rcode')}
                  onFocus={() => setFocused('rcode')} onBlur={() => setFocused('')}
                />
              </div>

              <button type="submit" disabled={loading} style={{
                width: '100%', padding: 12, background: loading ? '#b39ddb' : `linear-gradient(135deg, ${P}, #7b00c8)`,
                color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}>
                {loading ? 'Creating account…' : 'Create Account'}
              </button>

              <p style={{ textAlign: 'center', fontSize: 12, color: '#aaa', marginTop: 16, marginBottom: 0, lineHeight: 1.6 }}>
                An invite code is required to register.<br />Contact your administrator to get one.
              </p>
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', color: '#aaa', fontSize: 12, marginTop: 20 }}>
          © 2026 Sholok News · Authorized personnel only
        </p>
      </div>
    </div>
  );
}
