import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import "./AuthPage.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLang();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(form.email, form.password);

      // Redirect based on role
      if (user.role === "vendor") navigate("/vendor");
      else if (user.role === "admin") navigate("/admin");
      else if (user.role === "super_admin") navigate("/super-admin");
      else navigate("/");
    } catch (err) {
      setError(err.message || t('auth_loginFailed'));
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-in-up">
        <div className="auth-card__logo">
          <span>💼</span>
          <h1>Sholok Jobs</h1>
          <p>{t('auth_loginTitle')}</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('auth_email')}</label>
            <input
              type="email"
              required
              placeholder=""
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>{t('auth_password')}</label>
            <input
              type="password"
              required
              minLength={6}
              placeholder=""
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? t('auth_loginWait') : t('auth_loginBtn')}
          </button>
        </form>

        <div className="auth-switch">
          {t('auth_noAccount')} <Link to="/register">{t('auth_register')}</Link>
        </div>
      </div>
    </div>
  );
}
