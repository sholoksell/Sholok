import { useState } from 'react'
import { RotateCcw, Save, Wrench } from 'lucide-react'
import { PageHeading, PanelHead, SettingRow, Modal } from '../components/shared.jsx'

const defaults = {
  maintenance: false, signup: true, moderation: true, securityAlerts: true,
  emailNotifications: true, weeklyReport: false, mfa: true, sessionTimeout: true,
  ipAllowlist: false, backupAlerts: true, publicSearch: true,
}

export default function GlobalSettings() {
  const [settings, setSettings] = useState(defaults)
  const [maintenanceModal, setMaintenanceModal] = useState(false)
  const [saved, setSaved] = useState(false)

  function toggle(k) { setSettings(s => ({ ...s, [k]: !s[k] })) }

  function save() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <>
      <PageHeading
        title="Global Settings"
        desc="Configure platform-wide preferences, security policies and operational behavior."
        actions={<>
          <button className="btn" onClick={() => setSettings(defaults)}><RotateCcw size={14} /> Reset preferences</button>
          <button className="btn btn-primary" onClick={save}><Save size={14} /> {saved ? 'Saved!' : 'Save settings'}</button>
        </>}
      />

      <div className="two-col">
        <div className="panel">
          <PanelHead title="Platform preferences" desc="General appearance and behavior" />
          <div className="panel-body">
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="platformName">Platform name</label>
                <input id="platformName" className="input-control" defaultValue="Sholok" />
              </div>
              <div className="form-field">
                <label>Default language</label>
                <select className="input-control"><option>English</option><option>বাংলা</option></select>
              </div>
              <div className="form-field">
                <label>Default timezone</label>
                <select className="input-control"><option>Asia/Dhaka (UTC+06:00)</option><option>UTC</option></select>
              </div>
              <div className="form-field">
                <label>Date format</label>
                <select className="input-control"><option>DD MMM YYYY</option><option>MM/DD/YYYY</option><option>YYYY-MM-DD</option></select>
              </div>
              <div className="form-field full">
                <label>Brand colors</label>
                <div className="color-field">
                  <input type="color" defaultValue="#5D0096" />
                  <input className="input-control" defaultValue="#5D0096" />
                  <input type="color" defaultValue="#D31710" />
                  <input className="input-control" defaultValue="#D31710" />
                </div>
              </div>
            </div>
            <div className="divider" />
            <div className="setting-list">
              <SettingRow label="Allow account registration" desc="Enable new account registration across supported services." checked={settings.signup} onChange={v => toggle('signup')} />
              <SettingRow label="Public search enabled" desc="Allow public access to eligible search features." checked={settings.publicSearch} onChange={v => toggle('publicSearch')} />
              <SettingRow label="Admin email notifications" desc="Send operational notifications to designated admins." checked={settings.emailNotifications} onChange={v => toggle('emailNotifications')} />
              <SettingRow label="Weekly summary report" desc="Prepare a weekly operations summary." checked={settings.weeklyReport} onChange={v => toggle('weeklyReport')} />
            </div>
          </div>
        </div>

        <div className="panel">
          <PanelHead title="Security & operations" desc="Global policy switches" />
          <div className="panel-body">
            <div className="setting-list">
              <SettingRow label="Require MFA" desc="Require multi-factor authentication for privileged access." checked={settings.mfa} onChange={v => toggle('mfa')} />
              <SettingRow label="Session timeout" desc="Expire inactive admin sessions." checked={settings.sessionTimeout} onChange={v => toggle('sessionTimeout')} />
              <SettingRow label="IP allowlist" desc="Restrict admin access to approved IP ranges." checked={settings.ipAllowlist} onChange={v => toggle('ipAllowlist')} />
              <SettingRow label="Security alerting" desc="Enable security alert notifications." checked={settings.securityAlerts} onChange={v => toggle('securityAlerts')} />
              <SettingRow label="Backup alerts" desc="Notify administrators about backup failures." checked={settings.backupAlerts} onChange={v => toggle('backupAlerts')} />
              <SettingRow label="Content screening" desc="Enable content moderation workflows." checked={settings.moderation} onChange={v => toggle('moderation')} />
            </div>
            <div className="divider" />
            <div className="danger-zone">
              <h3>Maintenance mode</h3>
              <p>Maintenance mode may affect public service availability. Use only during an approved maintenance window.</p>
              <button className="btn btn-danger btn-sm" onClick={() => setMaintenanceModal(true)}>
                <Wrench size={13} /> Configure maintenance
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal open={maintenanceModal} onClose={() => setMaintenanceModal(false)} title="Maintenance mode"
        footer={<>
          <button className="btn" onClick={() => setMaintenanceModal(false)}>Cancel</button>
          <button className="btn btn-danger" onClick={() => { toggle('maintenance'); setMaintenanceModal(false) }}>
            {settings.maintenance ? 'Disable maintenance' : 'Enable maintenance'}
          </button>
        </>}
      >
        <div className="confirm-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <p>Enabling maintenance mode will restrict public access to the platform. Only proceed during an approved maintenance window.</p>
        </div>
        <p style={{ marginTop: 14, fontSize: 13 }}>
          Current status: <strong>{settings.maintenance ? 'Maintenance mode is ON' : 'Maintenance mode is OFF'}</strong>
        </p>
      </Modal>
    </>
  )
}
