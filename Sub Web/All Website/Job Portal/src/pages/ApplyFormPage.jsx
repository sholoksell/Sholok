import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { jobsAPI } from '../services/api';
import { useLang } from '../context/LanguageContext';
import './ApplyFormPage.css';

const STEPS_BN = ['ব্যক্তিগত তথ্য', 'শিক্ষা ও অভিজ্ঞতা', 'নথিপত্র', 'নিশ্চিতকরণ'];

const initialForm = {
  // Step 1
  fullName: '', phone: '', email: '', nid: '',
  address: '', district: '', gender: '', dob: '',
  // Step 2
  education: '', institution: '', passingYear: '', cgpa: '',
  prevCompany: '', prevDesignation: '', prevSalary: '', yearsExp: '',
  // Step 3
  coverLetter: '', portfolioUrl: '',
  // Step 4 - agreement
  agree: false,
};

export default function ApplyFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLang();
  const STEPS = [t('apply_step1'), t('apply_step2'), t('apply_step3'), t('apply_step4')];
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const data = await jobsAPI.getById(id);
        setJob(data);
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
      <h2>{t('apply_notFound')}</h2>
      <Link to="/" className="btn-back">{t('apply_goBack')}</Link>
    </div>
  );

  const update = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
  };

  const validateStep = () => {
    const errs = {};
    if (step === 0) {
      if (!form.fullName.trim()) errs.fullName = t('val_nameRequired');
      if (!form.phone.match(/^01[3-9]\d{8}$/)) errs.phone = t('val_invalidPhone');
      if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = t('val_invalidEmail');
      if (!form.gender) errs.gender = t('val_genderRequired');
      if (!form.district) errs.district = t('val_districtRequired');
    }
    if (step === 1) {
      if (!form.education) errs.education = t('val_educationRequired');
      if (!form.institution.trim()) errs.institution = t('val_institutionRequired');
      if (!form.passingYear) errs.passingYear = t('val_yearRequired');
    }
    if (step === 2) {
      if (!form.coverLetter.trim() || form.coverLetter.length < 50)
        errs.coverLetter = t('val_coverLetterMin');
    }
    if (step === 3) {
      if (!form.agree) errs.agree = t('val_agreeRequired');
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => { if (validateStep()) setStep(s => s + 1); };
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="apply-success container fade-in">
        <div className="apply-success__card">
          <div className="apply-success__icon">🎉</div>
          <h1>{t('apply_successTitle')}</h1>
          <p className="apply-success__sub">
            <strong>{job.company}</strong> {t('apply_successSub1')} <strong>{job.title}</strong> {t('apply_successSub2')}
          </p>
          <div className="apply-success__info">
            <p>📧 {t('apply_successEmail')} (<strong>{form.email}</strong>) {t('apply_successEmailSuffix')}</p>
            <p>📞 {t('apply_successContact')}</p>
          </div>
          <div className="apply-success__actions">
            <Link to="/" className="btn-primary-lg">{t('apply_moreJobs')}</Link>
            <Link to="/saved" className="btn-outline-lg">{t('apply_savedJobs')}</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="apply-page">
      <div className="container apply-page__inner">

        {/* Left: Form */}
        <div className="apply-form-wrapper">

          {/* Job mini header */}
          <div className="apply-job-header fade-in-up">
            <span className="apply-job-logo">{job.companyLogo}</span>
            <div>
              <Link to={`/jobs/${job._id || job.id}`} className="apply-job-title">{job.title}</Link>
              <p className="apply-job-company">{job.company} · {job.location}</p>
            </div>
          </div>

          {/* Stepper */}
          <div className="stepper fade-in-up">
            {STEPS.map((s, i) => (
              <div key={i} className={`stepper__step ${i < step ? 'done' : ''} ${i === step ? 'active' : ''}`}>
                <div className="stepper__circle">
                  {i < step ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : (i + 1)}
                </div>
                <span className="stepper__label">{s}</span>
                {i < STEPS.length - 1 && <div className="stepper__line"/>}
              </div>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="apply-form fade-in-up" noValidate>

            {/* ===== STEP 0: Personal ===== */}
            {step === 0 && (
              <div className="form-step">
                <h2 className="form-step__title">{t('apply_step1')}</h2>
                <div className="form-grid">
                  <FormField label={t('apply_fullName')} error={errors.fullName}>
                    <input type="text" placeholder={t('apply_namePlaceholder')}
                      value={form.fullName} onChange={e => update('fullName', e.target.value)} />
                  </FormField>
                  <FormField label={t('apply_mobile')} error={errors.phone}>
                    <input type="tel" placeholder="01XXXXXXXXX"
                      value={form.phone} onChange={e => update('phone', e.target.value)} />
                  </FormField>
                  <FormField label={t('apply_email')} error={errors.email}>
                    <input type="email" placeholder="example@email.com"
                      value={form.email} onChange={e => update('email', e.target.value)} />
                  </FormField>
                  <FormField label={t('apply_nid')} error={errors.nid}>
                    <input type="text" placeholder={t('apply_nidPlaceholder')}
                      value={form.nid} onChange={e => update('nid', e.target.value)} />
                  </FormField>
                  <FormField label={t('apply_gender')} error={errors.gender}>
                    <select value={form.gender} onChange={e => update('gender', e.target.value)}>
                      <option value="">{t('apply_selectGender')}</option>
                      <option value="male">{t('apply_male')}</option>
                      <option value="female">{t('apply_female')}</option>
                      <option value="other">{t('apply_other')}</option>
                    </select>
                  </FormField>
                  <FormField label={t('apply_dob')} error={errors.dob}>
                    <input type="date" value={form.dob} onChange={e => update('dob', e.target.value)} />
                  </FormField>
                  <FormField label={t('apply_district')} error={errors.district} fullWidth>
                    <select value={form.district} onChange={e => update('district', e.target.value)}>
                      <option value="">{t('apply_selectDistrict')}</option>
                      {['ঢাকা','চট্টগ্রাম','সিলেট','রাজশাহী','খুলনা','বরিশাল','রংপুর','ময়মনসিংহ',
                        'কুমিল্লা','গাজীপুর','নারায়ণগঞ্জ','টঙ্গী'].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label={t('apply_address')} error={errors.address} fullWidth>
                    <textarea rows={2} placeholder={t('apply_addressPlaceholder')}
                      value={form.address} onChange={e => update('address', e.target.value)} />
                  </FormField>
                </div>
              </div>
            )}

            {/* ===== STEP 1: Education ===== */}
            {step === 1 && (
              <div className="form-step">
                <h2 className="form-step__title">{t('apply_step2')}</h2>
                <div className="form-section-label">{t('apply_educationSection')}</div>
                <div className="form-grid">
                  <FormField label={t('apply_education')} error={errors.education}>
                    <select value={form.education} onChange={e => update('education', e.target.value)}>
                      <option value="">{t('apply_selectEducation')}</option>
                      <option value="ssc">SSC / সমমান</option>
                      <option value="hsc">HSC / সমমান</option>
                      <option value="diploma">ডিপ্লোমা</option>
                      <option value="bachelor">স্নাতক</option>
                      <option value="masters">স্নাতকোত্তর</option>
                      <option value="phd">পিএইচডি</option>
                    </select>
                  </FormField>
                  <FormField label={t('apply_institution')} error={errors.institution}>
                    <input type="text" placeholder={t('apply_institutionPlaceholder')}
                      value={form.institution} onChange={e => update('institution', e.target.value)} />
                  </FormField>
                  <FormField label={t('apply_passingYear')} error={errors.passingYear}>
                    <input type="number" min="1990" max="2026" placeholder="2022"
                      value={form.passingYear} onChange={e => update('passingYear', e.target.value)} />
                  </FormField>
                  <FormField label={t('apply_cgpa')} error={errors.cgpa}>
                    <input type="text" placeholder="3.75"
                      value={form.cgpa} onChange={e => update('cgpa', e.target.value)} />
                  </FormField>
                </div>

                <div className="form-section-label" style={{marginTop:'20px'}}>{t('apply_experienceSection')}</div>
                <div className="form-grid">
                  <FormField label={t('apply_prevCompany')}>
                    <input type="text" placeholder={t('apply_prevCompany')}
                      value={form.prevCompany} onChange={e => update('prevCompany', e.target.value)} />
                  </FormField>
                  <FormField label={t('apply_prevDesignation')}>
                    <input type="text" placeholder={t('apply_prevDesignation')}
                      value={form.prevDesignation} onChange={e => update('prevDesignation', e.target.value)} />
                  </FormField>
                  <FormField label={t('apply_totalExp')}>
                    <select value={form.yearsExp} onChange={e => update('yearsExp', e.target.value)}>
                      <option value="">{t('apply_selectEducation')}</option>
                      <option value="0">{t('apply_freshGrad')}</option>
                      <option value="1">{t('apply_year1')}</option>
                      <option value="2">{t('apply_year2')}</option>
                      <option value="3">{t('apply_year3')}</option>
                      <option value="5">{t('apply_year45')}</option>
                      <option value="7">{t('apply_year5plus')}</option>
                    </select>
                  </FormField>
                  <FormField label={t('apply_prevSalary')}>
                    <input type="number" placeholder={t('apply_prevSalary')}
                      value={form.prevSalary} onChange={e => update('prevSalary', e.target.value)} />
                  </FormField>
                </div>
              </div>
            )}

            {/* ===== STEP 2: Documents ===== */}
            {step === 2 && (
              <div className="form-step">
                <h2 className="form-step__title">{t('apply_coverLetterTitle')}</h2>
                <div className="form-grid">
                  <FormField label={`${t('apply_coverLetter')} (${form.coverLetter.length} ${t('apply_chars')})`} error={errors.coverLetter} fullWidth>
                    <textarea
                      rows={8}
                      placeholder={`Dear Hiring Manager,\n\nI am interested in the ${job.title} position...`}
                      value={form.coverLetter}
                      onChange={e => update('coverLetter', e.target.value)}
                    />
                  </FormField>
                  <FormField label={t('apply_portfolio')} error={errors.portfolioUrl} fullWidth>
                    <input type="url" placeholder="https://linkedin.com/in/yourprofile"
                      value={form.portfolioUrl} onChange={e => update('portfolioUrl', e.target.value)} />
                  </FormField>
                </div>
                <div className="cv-upload-area">
                  <div className="cv-upload-icon">📄</div>
                  <p className="cv-upload-title">{t('apply_cvUpload')}</p>
                  <p className="cv-upload-sub">{t('apply_cvFormat')}</p>
                  <label className="cv-upload-btn">
                    {t('apply_chooseFile')}
                    <input type="file" accept=".pdf,.doc,.docx" hidden />
                  </label>
                </div>
              </div>
            )}

            {/* ===== STEP 3: Confirmation ===== */}
            {step === 3 && (
              <div className="form-step">
                <h2 className="form-step__title">{t('apply_confirmTitle')}</h2>
                <div className="confirm-summary">
                  <h3>{t('apply_summary')}</h3>
                  <div className="confirm-grid">
                    <div className="confirm-item"><span>{t('apply_confirmName')}</span><strong>{form.fullName}</strong></div>
                    <div className="confirm-item"><span>{t('apply_confirmMobile')}</span><strong>{form.phone}</strong></div>
                    <div className="confirm-item"><span>{t('apply_confirmEmail')}</span><strong>{form.email}</strong></div>
                    <div className="confirm-item"><span>{t('apply_confirmDistrict')}</span><strong>{form.district}</strong></div>
                    <div className="confirm-item"><span>{t('apply_confirmEducation')}</span><strong>{form.education}</strong></div>
                    <div className="confirm-item"><span>{t('apply_confirmInstitution')}</span><strong>{form.institution}</strong></div>
                    <div className="confirm-item"><span>{t('apply_confirmPosition')}</span><strong>{job.title}</strong></div>
                    <div className="confirm-item"><span>{t('apply_confirmCompany')}</span><strong>{job.company}</strong></div>
                  </div>
                  <label className={`agree-checkbox ${errors.agree ? 'error' : ''}`}>
                    <input type="checkbox" checked={form.agree}
                      onChange={e => update('agree', e.target.checked)} />
                    <span>{t('apply_agreeText')}</span>
                  </label>
                  {errors.agree && <p className="field-error">{errors.agree}</p>}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="form-nav">
              {step > 0 && (
                <button type="button" onClick={prevStep} className="form-nav__back">
                  {t('apply_prev')}
                </button>
              )}
              {step < STEPS.length - 1 ? (
                <button type="button" onClick={nextStep} className="form-nav__next">
                  {t('apply_next')}
                </button>
              ) : (
                <button type="submit" className="form-nav__submit">
                  {t('apply_submit')}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right: Job Summary */}
        <aside className="apply-sidebar fade-in">
          <div className="apply-sidebar__card">
            <h3>{t('apply_summary')}</h3>
            <div className="apply-sidebar__job">
              <span className="apply-sidebar__logo">{job.companyLogo}</span>
              <div>
                <p className="apply-sidebar__job-title">{job.title}</p>
                <p className="apply-sidebar__company">{job.company}</p>
              </div>
            </div>
            <div className="apply-sidebar__details">
              <div><span>📍</span>{job.location}</div>
              <div><span>৳</span>{job.salary}</div>
              <div><span>⏱️</span>{job.type}</div>
              <div><span>📅</span>{t('detail_deadlineLabel')} {job.deadline}</div>
            </div>
          </div>

          <div className="apply-sidebar__tips">
            <h3>💡 {t('apply_step3')}</h3>
            <ul>
              <li>{t('val_nameRequired')}</li>
              <li>{t('apply_coverLetter')}</li>
              <li>{t('apply_cvUpload')}</li>
              <li>{t('apply_mobile')}</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function FormField({ label, error, children, fullWidth }) {
  return (
    <div className={`form-field ${fullWidth ? 'form-field--full' : ''} ${error ? 'form-field--error' : ''}`}>
      <label className="form-field__label">{label}</label>
      {children}
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
