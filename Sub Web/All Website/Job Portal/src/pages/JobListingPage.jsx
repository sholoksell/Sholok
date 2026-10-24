import { useState, useMemo, useEffect } from 'react';
import { jobsAPI, metaAPI } from '../services/api';
import { useLang } from '../context/LanguageContext';
import JobCard from '../components/JobCard';
import './JobListingPage.css';

export default function JobListingPage() {
  const { t } = useLang();
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [selectedLoc, setSelectedLoc] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [showFilters, setShowFilters] = useState(false);

  // Dynamic data from API
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [publicStats, setPublicStats] = useState({ totalJobs: 0, totalCompanies: 0 });
  const [loading, setLoading] = useState(true);

  // Fetch categories, locations, and stats on mount
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [cats, locs, stats] = await Promise.all([
          metaAPI.getCategories(),
          metaAPI.getLocations(),
          metaAPI.getPublicStats(),
        ]);
        setCategories(cats);
        setLocations(locs);
        setPublicStats(stats);
      } catch {
        // Defaults remain empty
      }
    };
    fetchMeta();
  }, []);

  // Fetch jobs from backend
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ limit: 100 });
        if (search.trim()) params.set('search', search);
        if (selectedCat !== 'all') params.set('category', selectedCat);
        if (selectedLoc) params.set('location', selectedLoc);
        if (selectedType) params.set('jobType', selectedType);
        if (sortBy) params.set('sort', sortBy);
        if (salaryRange === '0-30000') { params.set('salaryMax', '30000'); }
        else if (salaryRange === '30000-60000') { params.set('salaryMin', '30000'); params.set('salaryMax', '60000'); }
        else if (salaryRange === '60000+') { params.set('salaryMin', '60000'); }

        const data = await jobsAPI.getApproved(params.toString());
        setJobs(data.jobs || []);
      } catch {
        setJobs([]);
      }
      setLoading(false);
    };
    fetchJobs();
  }, [search, selectedCat, selectedLoc, selectedType, salaryRange, sortBy]);

  const featured = jobs.filter(j => j.featured);
  const hasFilters = search || selectedCat !== 'all' || selectedLoc || selectedType || salaryRange;

  const clearFilters = () => {
    setSearch(''); setSelectedCat('all'); setSelectedLoc('');
    setSelectedType(''); setSalaryRange('');
  };

  return (
    <div className="job-listing-page">

      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__text fade-in-up">
            <span className="hero__tag">{t('hero_tag')}</span>
            <h1>{t('hero_title1')}<br />{t('hero_title2')}</h1>
            <p>{t('hero_subtitle')}</p>
          </div>

          <div className="hero__search fade-in-up">
            <div className="hero__search-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder={t('hero_searchPlaceholder')}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button onClick={() => setSearch('')} className="hero__search-clear">✕</button>
              )}
            </div>
            <select value={selectedLoc} onChange={e => setSelectedLoc(e.target.value)} className="hero__location-select">
              <option value="">{t('hero_allDistricts')}</option>
              {locations.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <button className="hero__search-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              {t('hero_searchBtn')}
            </button>
          </div>

          <div className="hero__stats fade-in-up">
            <div className="hero__stat"><strong>{publicStats.totalJobs}+</strong><span>{t('hero_activeJobs')}</span></div>
            <div className="hero__stat-divider"/>
            <div className="hero__stat"><strong>{publicStats.totalCompanies}+</strong><span>{t('hero_companies')}</span></div>
            <div className="hero__stat-divider"/>
            <div className="hero__stat"><strong>{t('hero_successfulHiresCount')}</strong><span>{t('hero_successfulHires')}</span></div>
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES NAV ===== */}
      <section className="categories-bar">
        <div className="container">
          <div className="categories-scroll">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`cat-btn ${selectedCat === cat.id ? 'active' : ''}`}
              >
                {cat.label}
                <span className="cat-btn__count">{cat.count}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="container main-layout">

        {/* ===== SIDEBAR FILTERS ===== */}
        <aside className={`sidebar ${showFilters ? 'sidebar--open' : ''}`}>
          <div className="sidebar__header">
            <h3>{t('filter_title')}</h3>
            {hasFilters && (
              <button onClick={clearFilters} className="sidebar__clear">{t('filter_clearAll')}</button>
            )}
          </div>

          <div className="filter-group">
            <label>{t('filter_jobType')}</label>
            {[
              { value: 'পূর্ণকালীন', label: t('filter_fullTime') },
              { value: 'পার্টটাইম / ফ্রিল্যান্স', label: t('filter_partTime') },
              { value: 'চুক্তিভিত্তিক', label: t('filter_contract') },
            ].map(item => (
              <label key={item.value} className="filter-radio">
                <input type="radio" name="type" checked={selectedType === item.value}
                  onChange={() => setSelectedType(selectedType === item.value ? '' : item.value)} />
                {item.label}
              </label>
            ))}
          </div>

          <div className="filter-group">
            <label>{t('filter_salaryRange')}</label>
            {[
              { value: '0-30000', label: t('filter_below30k') },
              { value: '30000-60000', label: t('filter_30to60k') },
              { value: '60000+', label: t('filter_above60k') },
            ].map(s => (
              <label key={s.value} className="filter-radio">
                <input type="radio" name="salary" checked={salaryRange === s.value}
                  onChange={() => setSalaryRange(salaryRange === s.value ? '' : s.value)} />
                {s.label}
              </label>
            ))}
          </div>

          <div className="filter-group">
            <label>{t('filter_district')}</label>
            <select value={selectedLoc} onChange={e => setSelectedLoc(e.target.value)} className="filter-select">
              <option value="">{t('filter_allDistricts')}</option>
              {locations.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </aside>

        {/* ===== JOBS CONTENT ===== */}
        <div className="jobs-content">

          {/* Toolbar */}
          <div className="jobs-toolbar">
            <div className="jobs-toolbar__left">
              <button className="mobile-filter-btn" onClick={() => setShowFilters(!showFilters)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
                </svg>
                {t('filter_btn')}
              </button>
              <span className="jobs-count">
                <strong>{jobs.length}</strong> {t('jobs_found')}
              </span>
            </div>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="sort-select">
              <option value="latest">{t('sort_latest')}</option>
              <option value="salary">{t('sort_salary')}</option>
              <option value="featured">{t('sort_featured')}</option>
            </select>
          </div>

          {/* Featured section */}
          {!hasFilters && (
            <div className="featured-section">
              <h2 className="section-title">
                <span>⭐</span> {t('jobs_featured')}
              </h2>
              <div className="jobs-grid">
                {featured.map(job => (
                  <JobCard key={job._id || job.id} job={job} featured />
                ))}
              </div>
            </div>
          )}

          {/* All jobs */}
          <div className="all-jobs-section">
            {!hasFilters && (
              <h2 className="section-title">
                <span>📋</span> {t('jobs_all')}
              </h2>
            )}
            {loading ? (
              <div className="empty-state">
                <div className="empty-state__icon">⏳</div>
                <h3>{t('jobs_loading')}</h3>
              </div>
            ) : jobs.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state__icon">🔍</div>
                <h3>{t('jobs_noResults')}</h3>
                <p>{t('jobs_noResultsSub')}</p>
                <button onClick={clearFilters} className="btn-primary">{t('jobs_clearFilter')}</button>
              </div>
            ) : (
              <div className="jobs-grid">
                {jobs.map(job => (
                  <JobCard key={job._id || job.id} job={job} featured={job.featured} />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
