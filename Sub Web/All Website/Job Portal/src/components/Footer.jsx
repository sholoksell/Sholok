import { Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import './Footer.css';

export default function Footer() {
  const { t } = useLang();

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <Link to="/" className="footer__logo">
            <span>💼</span>
            <span><span style={{color:'var(--primary-light)'}}>Sholok</span> Jobs</span>
          </Link>
          <p className="footer__tagline">{t('footer_tagline')}</p>
        </div>

        <div className="footer__links-group">
          <h4>{t('footer_jobSeekers')}</h4>
          <Link to="/jobs">{t('footer_findJobs')}</Link>
          <Link to="/saved">{t('footer_savedJobs')}</Link>
          <a href="#">{t('footer_careerTips')}</a>
          <a href="#">{t('footer_createCV')}</a>
        </div>

        <div className="footer__links-group">
          <h4>{t('footer_employers')}</h4>
          <a href="#">{t('footer_postJob')}</a>
          <a href="#">{t('footer_cvDatabase')}</a>
          <a href="#">{t('footer_premiumPlan')}</a>
        </div>

        <div className="footer__links-group">
          <h4>{t('footer_contact')}</h4>
          <a href="#">📍 ঢাকা, বাংলাদেশ</a>
          <a href="#">📞 ০১৭২৬৪৩১৩৭৩</a>
          <a href="#">✉️ info@sholokjobs.com</a>
        </div>
      </div>
    </footer>
  );
}
