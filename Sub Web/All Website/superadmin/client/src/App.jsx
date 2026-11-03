import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/auth.jsx'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Overview from './pages/Overview.jsx'
import Services from './pages/Services.jsx'
import Users from './pages/Users.jsx'
import ServiceAdmins from './pages/ServiceAdmins.jsx'
import Roles from './pages/Roles.jsx'
import Content from './pages/Content.jsx'
import Commerce from './pages/Commerce.jsx'
import Analytics from './pages/Analytics.jsx'
import Security from './pages/Security.jsx'
import Audit from './pages/Audit.jsx'
import System from './pages/System.jsx'
import Integrations from './pages/Integrations.jsx'
import Notifications from './pages/Notifications.jsx'
import Backup from './pages/Backup.jsx'
import GlobalSettings from './pages/GlobalSettings.jsx'
import Support from './pages/Support.jsx'
import Approvals from './pages/Approvals.jsx'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="auth-loading"><div className="auth-spinner" /></div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/overview" replace />} />
            <Route path="overview" element={<Overview />} />
            <Route path="services" element={<Services />} />
            <Route path="users" element={<Users />} />
            <Route path="service-admins" element={<ServiceAdmins />} />
            <Route path="roles" element={<Roles />} />
            <Route path="content" element={<Content />} />
            <Route path="commerce" element={<Commerce />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="security" element={<Security />} />
            <Route path="audit" element={<Audit />} />
            <Route path="system" element={<System />} />
            <Route path="integrations" element={<Integrations />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="backup" element={<Backup />} />
            <Route path="settings" element={<GlobalSettings />} />
            <Route path="support" element={<Support />} />
            <Route path="approvals" element={<Approvals />} />
          </Route>
          <Route path="*" element={<Navigate to="/overview" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
