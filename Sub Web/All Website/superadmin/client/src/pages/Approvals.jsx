import { useState } from 'react'
import { Inbox, AlertTriangle, CheckCircle, GitPullRequest, Eye, Check, X } from 'lucide-react'
import { PageHeading, StatCard, PanelHead, StatusPill } from '../components/shared.jsx'

const initialApprovals = [
  { id: 'APR-2206', title: 'Seller verification', scope: 'Smart Store', status: 'Pending' },
  { id: 'APR-2205', title: 'Role permission change', scope: 'Access', status: 'In review' },
  { id: 'APR-2204', title: 'Publisher verification', scope: 'News', status: 'Pending' },
  { id: 'APR-2203', title: 'Refund request', scope: 'Pay', status: 'Pending' },
  { id: 'APR-2202', title: 'Production setting change', scope: 'Platform', status: 'In review' },
]

export default function Approvals() {
  const [approvals, setApprovals] = useState(initialApprovals)

  function approve(id) { setApprovals(a => a.map(x => x.id === id ? { ...x, status: 'Approved' } : x)) }
  function reject(id) { setApprovals(a => a.map(x => x.id === id ? { ...x, status: 'Rejected' } : x)) }

  const pending = approvals.filter(a => a.status === 'Pending' || a.status === 'In review')
  const high = approvals.filter(a => a.status === 'Pending')

  return (
    <>
      <PageHeading
        title="Approval Workflows"
        desc="Review sensitive changes, verification requests and operational approvals."
        actions={<>
          <button className="btn"><Eye size={14} /> Review queue</button>
          <button className="btn btn-primary"><GitPullRequest size={14} /> Configure workflows</button>
        </>}
      />

      <div className="stats-grid">
        <StatCard label="Awaiting review" value={pending.length} icon={Inbox} foot="Across all workflows" kind="amber" />
        <StatCard label="High priority" value={high.length} icon={AlertTriangle} foot="Needs faster review" kind="red" />
        <StatCard label="Approved today" value="18" icon={CheckCircle} foot="<span class='positive'>Completed</span>" kind="green" />
        <StatCard label="Workflow types" value="5" icon={GitPullRequest} foot="Active approval flows" />
      </div>

      <div className="panel table-panel">
        <PanelHead title="Pending approvals" desc="Review and action each request" />
        <div className="table-scroll">
          <table>
            <thead><tr><th>ID</th><th>Request</th><th>Scope</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {approvals.map((a, i) => (
                <tr key={i}>
                  <td className="table-primary">{a.id}</td>
                  <td>{a.title}</td>
                  <td>{a.scope}</td>
                  <td><StatusPill status={a.status === 'In review' ? 'Monitoring' : a.status === 'Approved' ? 'Active' : a.status === 'Rejected' ? 'Pending' : 'Pending'} /></td>
                  <td>
                    <div className="row-actions">
                      <button className="mini-icon-btn" title="View details"><Eye size={13} /></button>
                      {(a.status === 'Pending' || a.status === 'In review') && <>
                        <button className="mini-icon-btn" title="Approve" onClick={() => approve(a.id)} style={{ color: 'var(--green)' }}><Check size={13} /></button>
                        <button className="mini-icon-btn" title="Reject" onClick={() => reject(a.id)} style={{ color: 'var(--red)' }}><X size={13} /></button>
                      </>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <span>{approvals.length} approval requests</span>
        </div>
      </div>
    </>
  )
}
