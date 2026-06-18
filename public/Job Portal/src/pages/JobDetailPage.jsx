import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { jobsAPI, companiesAPI } from '../services/api';
import { useSavedJobs } from '../context/SavedJobsContext';
import { useLang } from '../context/LanguageContext';
import './JobDetailPage.css';

export default function JobDetailPage() {
  const { id } = useParams();
  const { isSaved, toggleSave } = useSavedJobs();
  const { t, lang, getLocalizedField } = useLang();
  const [job, setJob] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const data = await jobsAPI.getById(id);
        setJob(data);

        // Fetch company profile if companyRef exists
        if (data.companyRef) {
          try {
            const companyData = await companiesAPI.getById(data.companyRef);
            setCompany(companyData.company);
          } catch {}
        }
      } catch {
        setJob(null);
      }
      setLoading(false);
    };
    fetchJob();
  }, [id]);

  if (loading) return (
    <div className="not-found container">
      <p>{t('jobs_loading')}</p>
    </div>
  );

  if (!job) return (
    <div className="not-found container">
      <h2>{t('detail_notFound')}</h2>
      <Link to="/" className="btn-back">{t('detail_goBack')}</Link>
    </div>
  );

  const jobId = job._id || job.id;
  const saved = isSaved(jobId);

  const localizedDescription = getLocalizedField(job, 'description');
  const localizedRequirements = (job.requirements && (job[`requirements${lang === 'bn' ? 'Bn' : 'En'}`]?.length ? job[`requirements${lang === 'bn' ? 'Bn' : 'En'}`] : job.requirements)) || [];

  const descLines = localizedDescription.split('\n').map((line, i) => {
    if (line.startsWith('**') && line.endsWith('**')) {
      return <h4 key={i} className="job-detail__desc-heading">{line.replaceAll('**', '')}</h4>;
    }
    if (line.startsWith('•')) {
      return <li key={i} className="job-detail__desc-li">{line.slice(1).trim()}</li>;
    }
    return line ? <p key={i} className="job-detail__desc-p">{line}</p> : <br key={i}/>;
  });

  return (
    <div className="job-detail-page">
      <div className="container">
        <div className="job-detail__breadcrumb">
          <Link to="/">{t('detail_home')}</Link>
          <span>›</span>
          <Link to="/jobs">{t('detail_jobs')}</Link>
          <span>›</span>
          <span>{getLocalizedField(job, 'title')}</span>
        </div>

        <div className="job-detail__layout">

          {/* ===== LEFT: Main Content ===== */}
          <div className="job-detail__main">

            {/* Header Card */}
            <div className="job-detail__header-card fade-in-up">
              <div className="job-detail__header-top">
                <div className="job-detail__logo">{job.companyLogo}</div>
                <div className="job-detail__header-info">
                  <Link to={`/company/${job.companyRef || job._id}`} className="job-detail__company-link">
                    {job.company}
                  </Link>
                  <h1 className="job-detail__title">{getLocalizedField(job, 'title')}</h1>
                  <p className="job-detail__title-en">{job.titleEn}</p>
                </div>
              </div>

              <div className="job-detail__badges">
                {job.urgent && <span className="badge badge-red">{t('detail_urgentHiring')}</span>}
                {job.featured && <span className="badge badge-blue">{t('detail_featured')}</span>}
                <span className="badge badge-gray">{job.type || job.jobType}</span>
                <span className="badge badge-green">{job.vacancies} {t('detail_positions')}</span>
              </div>

              <div className="job-detail__meta-grid">
                <div className="job-detail__meta-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <div><span>{t('detail_location')}</span><strong>{job.location}</strong></div>
                </div>
                <div className="job-detail__meta-item">
                  <span className="taka-icon taka-icon--lg">৳</span>
                  <div><span>{t('detail_salary')}</span><strong>{job.salary}</strong></div>
                </div>
                <div className="job-detail__meta-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2"/>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                  </svg>
                  <div><span>{t('detail_experience')}</span><strong>{job.experience}</strong></div>
                </div>
                <div className="job-detail__meta-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <div><span>{t('detail_deadline')}</span><strong>{job.deadline}</strong></div>
                </div>
              </div>

              <div className="job-detail__actions">
                <Link to={`/jobs/${jobId}/apply`} className="job-detail__apply-btn">
                  {t('detail_applyNow')}
                </Link>
                <button
                  onClick={() => toggleSave(job)}
                  className={`job-detail__save-btn ${saved ? 'saved' : ''}`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24"
                    fill={saved ? 'currentColor' : 'none'}
                    stroke="currentColor" strokeWidth="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                  </svg>
                  {saved ? t('detail_saved') : t('detail_save')}
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="job-detail__card fade-in-up">
              <h2 className="job-detail__card-title">{t('detail_description')}</h2>
              <div className="job-detail__description">{descLines}</div>
            </div>

            {/* Skills */}
            <div className="job-detail__card fade-in-up">
              <h2 className="job-detail__card-title">{t('detail_skills')}</h2>
              <div className="job-detail__skills">
                {job.skills.map(skill => (
                  <span key={skill} className="job-detail__skill-tag">{skill}</span>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div className="job-detail__card fade-in-up">
              <h2 className="job-detail__card-title">{t('detail_requirements')}</h2>
              <ul className="job-detail__req-list">
                {localizedRequirements.map((r, i) => (
                  <li key={i}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            {/* Benefits */}
            <div className="job-detail__card fade-in-up">
              <h2 className="job-detail__card-title">{t('detail_benefits')}</h2>
              <div className="job-detail__benefits">
                {job.benefits.map((b, i) => (
                  <span key={i} className="job-detail__benefit">🎁 {b}</span>
                ))}
              </div>
            </div>
          </div>

          {/* ===== RIGHT: Sidebar ===== */}
          <aside className="job-detail__sidebar">
            {/* Company Card */}
            {company && (
              <div className="job-detail__company-card fade-in-up">
                <div className="jd-company__header">
                  <span className="jd-company__logo">{company.logo}</span>
                  <div>
                    <Link to={`/company/${company._id}`} className="jd-company__name">{company.name}</Link>
                    <p className="jd-company__industry">{company.industry}</p>
                  </div>
                </div>
                <div className="jd-company__stats">
                  <div className="jd-company__stat">
                    <span>📍</span><span>{company.location}</span>
                  </div>
                  <div className="jd-company__stat">
                    <span>👥</span><span>{company.size}</span>
                  </div>
                  <div className="jd-company__stat">
                    <span>⭐</span><span>{company.rating} ({company.reviews} {t('detail_review')})</span>
                  </div>
                </div>
                <Link to={`/company/${company._id}`} className="jd-company__profile-btn">
                  {t('detail_companyProfile')}
                </Link>
              </div>
            )}

            {/* Quick Apply CTA */}
            <div className="job-detail__quick-apply fade-in-up">
              <h3>{t('detail_applyToday')}</h3>
              <p>{t('detail_applyBeforeDeadline')}</p>
              <div className="jd-deadline">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                {t('detail_deadlineLabel')} {job.deadline}
              </div>
              <Link to={`/jobs/${jobId}/apply`} className="jd-apply-cta">
                {t('detail_fillForm')}
              </Link>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
