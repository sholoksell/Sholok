import { Link } from 'react-router-dom';
import { useSavedJobs } from '../context/SavedJobsContext';
import { useLang } from '../context/LanguageContext';
import './JobCard.css';

export default function JobCard({ job, featured = false }) {
  const { isSaved, toggleSave } = useSavedJobs();
  const { t } = useLang();
  const jobId = job._id || job.id;
  const saved = isSaved(jobId);

  return (
    <article className={`job-card fade-in-up ${featured ? 'job-card--featured' : ''}`}>
      {/* Top row */}
      <div className="job-card__header">
        <div className="job-card__logo">{job.companyLogo}</div>
        <div className="job-card__meta">
          <Link to={job.companyId ? `/company/${job.companyId}` : '#'} className="job-card__company">
            {job.company}
          </Link>
          <span className="job-card__posted">{job.posted || (job.createdAt ? new Date(job.createdAt).toLocaleDateString('bn-BD') : '')}</span>
        </div>
        <button
          onClick={(e) => { e.preventDefault(); toggleSave(job); }}
          className={`job-card__save-btn ${saved ? 'saved' : ''}`}
          title={saved ? t('card_unsave') : t('card_save')}
          aria-label={saved ? 'Remove from saved' : 'Save job'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24"
            fill={saved ? 'currentColor' : 'none'}
            stroke="currentColor" strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
      </div>

      {/* Title */}
      <Link to={`/jobs/${jobId}`} className="job-card__title">
        {job.title}
      </Link>
      <p className="job-card__title-en">{job.titleEn}</p>

      {/* Badges */}
      <div className="job-card__tags">
        {job.urgent && <span className="badge badge-red">{t('card_urgent')}</span>}
        {featured && <span className="badge badge-blue">{t('card_featured')}</span>}
        <span className="badge badge-gray">{job.type || job.jobType}</span>
        <span className="badge badge-gray">{job.category}</span>
      </div>

      {/* Info row */}
      <div className="job-card__info">
        <span className="job-card__info-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          {job.location}
        </span>
        <span className="job-card__info-item">
          <span className="taka-icon">৳</span>
          {job.salary}
        </span>
        <span className="job-card__info-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
          </svg>
          {job.experience}
        </span>
      </div>

      {/* Skills */}
      <div className="job-card__skills">
        {job.skills.slice(0, 4).map(skill => (
          <span key={skill} className="job-card__skill">{skill}</span>
        ))}
        {job.skills.length > 4 && (
          <span className="job-card__skill job-card__skill--more">+{job.skills.length - 4}</span>
        )}
      </div>

      {/* Footer */}
      <div className="job-card__footer">
        <span className="job-card__deadline">{t('card_deadline')} {job.deadline}</span>
        <Link to={`/jobs/${jobId}`} className="job-card__apply-btn">
          {t('card_viewDetails')}
        </Link>
      </div>
    </article>
  );
}
