import { Link } from 'react-router-dom';
import { useSavedJobs } from '../context/SavedJobsContext';
import { useLang } from '../context/LanguageContext';
import JobCard from '../components/JobCard';
import './SavedJobsPage.css';

export default function SavedJobsPage() {
  const { savedJobs, clearAll } = useSavedJobs();
  const { t } = useLang();

  return (
    <div className="saved-page">
      <div className="container">

        {/* Header */}
        <div className="saved-page__header fade-in-up">
          <div>
            <h1 className="saved-page__title">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--accent)" stroke="var(--accent)" strokeWidth="1.5">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
              {t('saved_title')}
            </h1>
            <p className="saved-page__sub">
              {savedJobs.length > 0
                ? `${t('saved_countPrefix')} ${savedJobs.length} ${t('saved_countSuffix')}`
                : t('saved_empty')}
            </p>
          </div>
          {savedJobs.length > 0 && (
            <button onClick={clearAll} className="saved-page__clear-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14H6L5 6"/>
                <path d="M10 11v6M14 11v6"/>
              </svg>
              {t('saved_clearAll')}
            </button>
          )}
        </div>

        {/* Content */}
        {savedJobs.length === 0 ? (
          <div className="saved-empty fade-in-up">
            <div className="saved-empty__illustration">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="1.5">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <h2>{t('saved_noSaved')}</h2>
            <p>{t('saved_noSavedSub')}</p>
            <Link to="/jobs" className="saved-empty__cta">
              {t('saved_findJobs')}
            </Link>
          </div>
        ) : (
          <>
            <div className="saved-jobs-grid fade-in-up">
              {savedJobs.map(job => (
                <JobCard key={job.id} job={job} featured={job.featured} />
              ))}
            </div>

            <div className="saved-page__footer fade-in-up">
              <p>{t('saved_browserNote')}</p>
              <Link to="/jobs" className="saved-browse-more">{t('saved_browseMore')}</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
