import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import "./AuthPage.css";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { t } = useLang();
  const [role, setRole] = useState("user");
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "", company: "", phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError(t('auth_passwordMismatch'));
      return;
    }

    if (role === "vendor" && !form.company.trim()) {
      setError(t('auth_companyRequired'));
      return;
    }

    setLoading(true);
    try {
      const user = await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role,
        company: form.company,
        phone: form.phone,
      });

      if (user.role === "vendor") navigate("/vendor");
      else navigate("/");
    } catch (err) {
      setError(err.message || t('auth_registerFailed'));
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-in-up">
        <div className="auth-card__logo">
          <span>💼</span>
          <h1>Sholok Jobs</h1>
          <p>{t('auth_registerTitle')}</p>
        </div>

        {/* Role Selector */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8, display: "block" }}>
            {t('auth_whoAreYou')}
          </label>
          <div className="role-selector">
            <button
              type="button"
              className={`role-btn ${role === "user" ? "active" : ""}`}
              onClick={() => setRole("user")}
            >
              {t('auth_jobSeeker')}
            </button>
            <button
              type="button"
              className={`role-btn ${role === "vendor" ? "active" : ""}`}
              onClick={() => setRole("vendor")}
            >
              {t('auth_employer')}
            </button>
          </div>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('auth_fullName')}</label>
            <input
              type="text"
              required
              placeholder=""
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>{t('auth_email')} *</label>
            <input
              type="email"
              required
              placeholder=""
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          {role === "vendor" && (
            <div className="form-group">
              <label>{t('auth_companyName')}</label>
              <input
                type="text"
                placeholder=""
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
              />
            </div>
          )}

          <div className="form-group">
            <label>{t('auth_mobile')}</label>
            <input
              type="tel"
              placeholder=""
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          <div className="auth-form form-row" style={{ gap: 12 }}>
            <div className="form-group">
              <label>{t('auth_passwordLabel')}</label>
              <input
                type="password"
                required
                minLength={6}
                placeholder=""
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>{t('auth_confirmPassword')}</label>
              <input
                type="password"
                required
                minLength={6}
                placeholder=""
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              />
            </div>
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? t('auth_registerWait') : t('auth_registerBtn')}
          </button>
        </form>

        <div className="auth-switch">
          {t('auth_hasAccount')} <Link to="/login">{t('auth_loginLink')}</Link>
        </div>
      </div>
    </div>
  );
}
