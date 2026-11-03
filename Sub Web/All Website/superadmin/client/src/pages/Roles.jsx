import { useState } from 'react'
import { Download, Plus, KeyRound, LayoutGrid, ShieldCheck, Layers, SlidersHorizontal, Trash2 } from 'lucide-react'
import { PageHeading, StatCard, PanelHead, StatusPill, Modal } from '../components/shared.jsx'

const ADMIN_MODULES = ['Dashboard','User Management','Service Admins','Roles & Permissions','Service Management','Content & Moderation','Commerce & Marketplace','Pay & Finance','Approval Workflows','Analytics & Reports','Security Center','Audit Logs','System Health','Integrations & APIs','Notifications','Backup & Recovery','Global Settings','Support Center']
const ACTIONS = ['View','Create','Edit','Delete','Approve','Reject','Publish','Export','Import','Assign','Configure','Suspend','Restore','Refund','Manage Settings']

const defaultRoles = {
  'Super Admin': Object.fromEntries(ADMIN_MODULES.map(m => [m, [...ACTIONS]])),
  'Platform Administrator': Object.fromEntries(ADMIN_MODULES.map(m => [m, ['Dashboard','Service Management','User Management','Service Admins','Analytics & Reports','System Health','Integrations & APIs','Global Settings'].includes(m) ? ['View','Create','Edit','Approve'] : []])),
  'Service Administrator': Object.fromEntries(ADMIN_MODULES.map(m => [m, ['Dashboard','Service Management','Analytics & Reports','User Management'].includes(m) ? ['View','Create','Edit','Approve'] : []])),
  'Content Moderator': Object.fromEntries(ADMIN_MODULES.map(m => [m, ['Dashboard','Content & Moderation','Approval Workflows'].includes(m) ? ['View','Edit','Approve'] : []])),
  'Finance Manager': Object.fromEntries(ADMIN_MODULES.map(m => [m, ['Dashboard','Pay & Finance','Analytics & Reports','Approval Workflows'].includes(m) ? ['View','Create','Edit','Approve'] : []])),
  'Support Agent': Object.fromEntries(ADMIN_MODULES.map(m => [m, ['Dashboard','User Management','Support Center'].includes(m) ? ['View','Edit'] : []])),
  'Analyst': Object.fromEntries(ADMIN_MODULES.map(m => [m, ['Dashboard','Analytics & Reports','Audit Logs','System Health'].includes(m) ? ['View'] : []])),
  'Viewer': Object.fromEntries(ADMIN_MODULES.map(m => [m, ['Dashboard','Analytics & Reports'].includes(m) ? ['View'] : []])),
}

export default function Roles() {
  const [roles, setRoles] = useState(defaultRoles)
  const [editRole, setEditRole] = useState(null)
  const [newRoleName, setNewRoleName] = useState('')
  const [createModal, setCreateModal] = useState(false)
  const roleNames = Object.keys(roles)

  const matrix = editRole ? roles[editRole] : null

  function togglePerm(mod, action) {
    setRoles(r => {
      const curr = r[editRole][mod] || []
      const next = curr.includes(action) ? curr.filter(x => x !== action) : [...curr, action]
      return { ...r, [editRole]: { ...r[editRole], [mod]: next } }
    })
  }

  function toggleAll(mod) {
    setRoles(r => {
      const curr = r[editRole][mod] || []
      const next = curr.length === ACTIONS.length ? [] : [...ACTIONS]
      return { ...r, [editRole]: { ...r[editRole], [mod]: next } }
    })
  }

  function createRole() {
    if (!newRoleName.trim() || roles[newRoleName]) return
    setRoles(r => ({ ...r, [newRoleName]: Object.fromEntries(ADMIN_MODULES.map(m => [m, []])) }))
    setNewRoleName('')
    setCreateModal(false)
  }

  function deleteRole(name) {
    const r = { ...roles }
    delete r[name]
    setRoles(r)
  }

  return (
    <>
      <PageHeading
        title="Roles & Permissions"
        desc="Define what each Service Admin role can view, create, edit, delete and approve inside assigned service panels."
        actions={<>
          <button className="btn"><Download size={14} /> Export matrix</button>
          <button className="btn btn-primary" onClick={() => setCreateModal(true)}><Plus size={14} /> Create role</button>
        </>}
      />

      <div className="stats-grid">
        <StatCard label="Defined roles" value={roleNames.length} icon={KeyRound} foot="Reusable admin roles" />
        <StatCard label="Permission modules" value={ADMIN_MODULES.length} icon={LayoutGrid} foot="Admin panel modules" />
        <StatCard label="Permission actions" value={ACTIONS.length} icon={ShieldCheck} foot="Granular controls" />
        <StatCard label="Service panels" value={17} icon={Layers} foot="Service-wise assignments" />
      </div>

      <div className="inline-note" style={{ marginBottom: 16 }}>
        <ShieldCheck size={15} />
        Roles control admin-panel capabilities. Service Admins separately define which service panels an administrator can enter. Effective access is the intersection of assigned services and the role permissions.
      </div>

      <div className="panel table-panel">
        <PanelHead title="Role directory" desc="Select a role to configure its module-level permission matrix" />
        <div className="table-scroll">
          <table>
            <thead>
              <tr><th>Role</th><th>Modules with access</th><th>Allowed actions</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {roleNames.map(r => {
                const matrix = roles[r]
                const mods = Object.values(matrix).filter(x => x.length).length
                const acts = Object.values(matrix).flat().length
                return (
                  <tr key={r}>
                    <td>
                      <strong>{r}</strong>
                      {r === 'Super Admin' && <small className="table-sub">Protected system role</small>}
                    </td>
                    <td>{mods} / {ADMIN_MODULES.length}</td>
                    <td>{acts} permissions</td>
                    <td>
                      <div className="row-actions">
                        <button className="mini-icon-btn" title="Edit permissions" onClick={() => setEditRole(r)}><SlidersHorizontal size={13} /></button>
                        {r !== 'Super Admin' && <button className="mini-icon-btn" title="Delete role" onClick={() => deleteRole(r)}><Trash2 size={13} /></button>}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={!!editRole}
        onClose={() => setEditRole(null)}
        title={`Edit: ${editRole}`}
        footer={<button className="btn btn-primary" onClick={() => setEditRole(null)}>Done</button>}
      >
        {matrix && (
          <div style={{ overflowX: 'auto' }}>
            <table className="permission-matrix">
              <thead>
                <tr>
                  <th>Module</th>
                  {ACTIONS.map(a => <th key={a} style={{ writingMode: 'vertical-lr', fontSize: 11, padding: '4px 6px' }}>{a}</th>)}
                  <th>All</th>
                </tr>
              </thead>
              <tbody>
                {ADMIN_MODULES.map(mod => (
                  <tr key={mod}>
                    <td style={{ textAlign: 'left', fontSize: 12, fontWeight: 700 }}>{mod}</td>
                    {ACTIONS.map(action => (
                      <td key={action}>
                        <input
                          type="checkbox"
                          checked={(matrix[mod] || []).includes(action)}
                          onChange={() => togglePerm(mod, action)}
                          disabled={editRole === 'Super Admin'}
                        />
                      </td>
                    ))}
                    <td>
                      <input
                        type="checkbox"
                        checked={(matrix[mod] || []).length === ACTIONS.length}
                        onChange={() => toggleAll(mod)}
                        disabled={editRole === 'Super Admin'}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>

      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Create role"
        footer={<>
          <button className="btn" onClick={() => setCreateModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={createRole}>Create role</button>
        </>}
      >
        <div className="form-field">
          <label>Role name</label>
          <input value={newRoleName} onChange={e => setNewRoleName(e.target.value)} placeholder="e.g. Regional Manager" />
        </div>
      </Modal>
    </>
  )
}
