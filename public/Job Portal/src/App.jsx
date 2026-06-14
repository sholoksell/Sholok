import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SavedJobsProvider } from './context/SavedJobsContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import JobListingPage from './pages/JobListingPage';
import JobDetailPage from './pages/JobDetailPage';
import ApplyFormPage from './pages/ApplyFormPage';
import CompanyProfilePage from './pages/CompanyProfilePage';
import SavedJobsPage from './pages/SavedJobsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VendorDashboard from './dashboards/VendorDashboard';
import AdminDashboard from './dashboards/AdminDashboard';
import SuperAdminDashboard from './dashboards/SuperAdminDashboard';

export default function App() {
  return (
    <LanguageProvider>
    <AuthProvider>
      <SavedJobsProvider>
        <BrowserRouter basename="/job-portal">
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<JobListingPage />} />
                <Route path="/jobs" element={<JobListingPage />} />
                <Route path="/jobs/:id" element={<JobDetailPage />} />
                <Route path="/jobs/:id/apply" element={<ApplyFormPage />} />
                <Route path="/company/:id" element={<CompanyProfilePage />} />
                <Route path="/saved" element={<SavedJobsPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected Dashboard Routes */}
                <Route path="/vendor" element={
                  <ProtectedRoute roles={['vendor']}>
                    <VendorDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/vendor" element={
                  <ProtectedRoute roles={['vendor']}>
                    <VendorDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute roles={['admin', 'super_admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin" element={
                  <ProtectedRoute roles={['admin', 'super_admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/super-admin" element={
                  <ProtectedRoute roles={['super_admin']}>
                    <SuperAdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/super-admin" element={
                  <ProtectedRoute roles={['super_admin']}>
                    <SuperAdminDashboard />
                  </ProtectedRoute>
                } />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </SavedJobsProvider>
    </AuthProvider>
    </LanguageProvider>
  );
}
