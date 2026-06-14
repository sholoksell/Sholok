import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { companiesAPI } from '../services/api';
import { useLang } from '../context/LanguageContext';
import JobCard from '../components/JobCard';
import './CompanyProfilePage.css';

export default function CompanyProfilePage() {
  const { id } = useParams();
  const { t } = useLang();
  const [company, setCompany] = useState(null);
  const [companyJobs, setCompanyJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const data = await companiesAPI.getById(id);
        setCompany(data.company);
        setCompanyJobs(data.jobs || []);
      } catch {
        setCompany(null);
      }
      setLoading(false);
    };
    fetchCompany();
  }, [id]);

  if (loading) return (
    <div className="not-found container">
      <p>{t('jobs_loading')}</p>
    </div>
  );

  if (!company) return (
    <div className="not-found container">
      <h2>{t('company_notFound')}</h2>
      <Link to="/" className="btn-back">{t('company_goBack')}</Link>
    </div>
  );

  const stars = Array.from({ length: 5 }, (_, i) => i < Math.round(company.rating));

  return (
    <div className="company-page">
      {/* Cover Banner */}
      <div className="company-banner" style={{ background: `linear-gradient(135deg, var(--primary-dark), var(--primary-light))` }}>
        <div className="container company-banner__inner">
          <div className="company-banner__logo">{company.logo}</div>
          <div className="company-banner__info">
            <h1>{company.name}</h1>
            <p className="company-banner__industry">{company.industry}</p>
            <div className="company-banner__meta">
              <span>📍 {company.location}</span>
              <span>👥 {company.size}</span>
              <span>🏢 {t('company_established')} {company.founded}</span>
              <span>🌐 {company.website}</span>
            </div>
          </div>
          <div className="company-banner__rating">
            <div className="rating-score">{company.rating}</div>
            <div className="rating-stars">
              {stars.map((filled, i) => (
                <span key={i} className={`star ${filled ? 'filled' : ''}`}>★</span>
              ))}
            </div>
            <div className="rating-reviews">{company.reviews} {t('detail_review')}</div>
          </div>
        </div>
      </div>

      <div className="container company-layout">

        {/* Left - Main */}
        <div className="company-main">

          {/* About */}
          <div className="company-card fade-in-up">
            <h2 className="company-card__title">{t('company_about')}</h2>
            <p className="company-about">{company.description}</p>
          </div>

          {/* Benefits */}
          <div className="company-card fade-in-up">
            <h2 className="company-card__title">{t('company_benefits')}</h2>
            <div className="company-benefits">
              {company.benefits.map((b, i) => (
                <div key={i} className="company-benefit-item">
                  <span className="company-benefit-icon">✅</span>
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Active Jobs */}
          <div className="company-card fade-in-up">
            <div className="company-card__header-row">
              <h2 className="company-card__title" style={{marginBottom:0}}>{t('company_activeJobs')}</h2>
              <span className="badge badge-blue">{companyJobs.length} {t('company_openPositions')}</span>
            </div>
            {companyJobs.length === 0 ? (
              <div className="empty-state-sm">
                <p>{t('company_noJobs')}</p>
              </div>
            ) : (
              <div className="company-jobs-grid">
                {companyJobs.map(job => (
                  <JobCard key={job._id || job.id} job={job} featured={job.featured} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right - Sidebar */}
        <aside className="company-sidebar">
          {/* Quick facts */}
          <div className="company-sidebar__card fade-in-up">
            <h3>{t('company_quickFacts')}</h3>
            <div className="company-facts">
              <div className="company-fact">
                <span className="company-fact__icon">🏭</span>
                <div>
                  <span>{t('company_industry')}</span>
                  <strong>{company.industry}</strong>
                </div>
              </div>
              <div className="company-fact">
                <span className="company-fact__icon">👥</span>
                <div>
                  <span>{t('company_employees')}</span>
                  <strong>{company.size}</strong>
                </div>
              </div>
              <div className="company-fact">
                <span className="company-fact__icon">📅</span>
                <div>
                  <span>{t('company_founded')}</span>
                  <strong>{company.founded}</strong>
                </div>
              </div>
              <div className="company-fact">
                <span className="company-fact__icon">📍</span>
                <div>
                  <span>{t('company_headquarters')}</span>
                  <strong>{company.location}</strong>
                </div>
              </div>
              <div className="company-fact">
                <span className="company-fact__icon">🌐</span>
                <div>
                  <span>{t('company_website')}</span>
                  <strong>{company.website}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Rating breakdown */}
          <div className="company-sidebar__card fade-in-up">
            <h3>{t('company_satisfaction')}</h3>
            <div className="rating-big">
              <span className="rating-big__num">{company.rating}</span>
              <div>
                <div className="rating-big__stars">
                  {stars.map((filled, i) => (
                    <span key={i} className={`star ${filled ? 'filled' : ''}`}>★</span>
                  ))}
                </div>
                <p>{company.reviews} {t('company_reviewCount')}</p>
              </div>
            </div>
            <div className="rating-bars">
              {[
                { label: t('company_workEnvironment'), val: 82 },
                { label: t('company_careerGrowth'), val: 74 },
                { label: t('company_salaryBenefits'), val: 70 },
                { label: t('company_workLifeBalance'), val: 68 },
              ].map(r => (
                <div key={r.label} className="rating-bar-item">
                  <span>{r.label}</span>
                  <div className="rating-bar-track">
                    <div className="rating-bar-fill" style={{ width: `${r.val}%` }}/>
                  </div>
                  <span className="rating-bar-pct">{r.val}%</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
