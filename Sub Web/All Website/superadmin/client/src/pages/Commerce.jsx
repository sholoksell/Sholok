import { Download } from 'lucide-react'
import { PageHeading, StatCard, PanelHead, StatusPill, SettingRow } from '../components/shared.jsx'
import { useState } from 'react'
import { ShoppingCart, Store, CreditCard, RotateCcw } from 'lucide-react'

const commerceServices = [
  { name: 'Shopping', icon: '🛍', desc: 'Central marketplace catalog, campaigns, orders and checkout' },
  { name: 'Smart Store', icon: '🏪', desc: 'Seller public stores, listings, inventory and settlements' },
  { name: 'Finance', icon: '📈', desc: 'Financial data feeds, insights and provider quality' },
  { name: 'Main Portal', icon: '🌐', desc: 'Central Sholok portal and service discovery' },
]

const txns = [
  { ref: 'TXN-20261028-1042', type: 'Marketplace payment', amount: '৳ 12,450', status: 'Completed' },
  { ref: 'TXN-20261028-1041', type: 'Seller settlement', amount: '৳ 8,200', status: 'Pending' },
  { ref: 'TXN-20261028-1040', type: 'Customer refund', amount: '৳ 1,250', status: 'Review' },
]

export default function Commerce() {
  const [settings, setSettings] = useState({ securityAlerts: true, mfa: true, weeklyReport: false })
  function toggle(k) { setSettings(s => ({ ...s, [k]: !s[k] })) }

  return (
    <>
      <PageHeading
        title="Commerce & Marketplace"
        desc="Monitor marketplace operations, seller performance, payments and financial data providers."
        actions={<button className="btn"><Download size={14} /> Export report</button>}
      />

      <div className="stats-grid">
        <StatCard label="Marketplace orders" value="18,642" icon={ShoppingCart} foot="<span class='positive'>↑ 9.6%</span> this month" />
        <StatCard label="Active sellers" value="4,281" icon={Store} foot="Verified seller accounts" kind="green" />
        <StatCard label="Payment transactions" value="98,624" icon={CreditCard} foot="Processed in selected period" />
        <StatCard label="Refunds awaiting review" value="46" icon={RotateCcw} foot="<span class='negative'>Needs review</span>" kind="red" />
      </div>

      <div className="section-grid">
        {commerceServices.map(s => (
          <article key={s.name} className="service-card">
            <div className="service-card-top">
              <div className="service-logo" style={{ fontSize: 18 }}>{s.icon}</div>
              <span className="status-pill">Active</span>
            </div>
            <h3>{s.name}</h3>
            <p>{s.desc}</p>
            <div className="service-card-bottom">
              <span className="service-meta">Commerce module</span>
              <button>Manage <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg></button>
            </div>
          </article>
        ))}
      </div>

      <div className="dashboard-grid" style={{ marginTop: 17 }}>
        <section className="panel">
          <PanelHead title="Transaction monitoring" desc="Review provider and transaction status" />
          <div className="table-scroll">
            <table>
              <thead><tr><th>Reference</th><th>Type</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>
                {txns.map(t => (
                  <tr key={t.ref}>
                    <td className="table-primary">{t.ref}</td>
                    <td>{t.type}</td>
                    <td>{t.amount}</td>
                    <td><StatusPill status={t.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="panel">
          <PanelHead title="Financial controls" desc="Secure payment operations" />
          <div className="panel-body setting-list">
            <SettingRow label="Payment risk alerts" desc="Notify the security team about suspicious transactions." checked={settings.securityAlerts} onChange={v => toggle('securityAlerts')} />
            <SettingRow label="Require MFA for finance actions" desc="Require re-authentication for sensitive actions." checked={settings.mfa} onChange={v => toggle('mfa')} />
            <SettingRow label="Weekly settlement report" desc="Include settlement summaries in the weekly report." checked={settings.weeklyReport} onChange={v => toggle('weeklyReport')} />
          </div>
        </section>
      </div>
    </>
  )
}
