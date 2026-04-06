import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import { AuthProvider, useAuth }  from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import ProtectedRoute    from './components/ProtectedRoute'
import LoadingScreen     from './components/LoadingScreen'
import { AnimatePresence, motion } from 'motion/react'

// Lazy load all pages for better performance
const Landing = lazy(() => import('./pages/Landing'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const TermsOfService = lazy(() => import('./pages/TermsOfService'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Detection = lazy(() => import('./pages/Detection'))
const Results = lazy(() => import('./pages/Results'))
const History = lazy(() => import('./pages/History'))
const Profile = lazy(() => import('./pages/Profile'))
const AdminUsers = lazy(() => import('./pages/AdminUsers'))
const AdminReports = lazy(() => import('./pages/AdminReports'))
const AdminSettings = lazy(() => import('./pages/AdminSettings'))
const ApiKeyManagement = lazy(() => import('./pages/ApiKeyManagement'))
const AppLayout = lazy(() => import('./components/AppLayout'))
const Navbar = lazy(() => import('./components/Navbar'))

// Preload critical routes
const preloadRoutes = () => {
  // Preload dashboard and detection as they are most used
  import('./pages/Dashboard')
  import('./pages/Detection')
}

function AppContent() {
  const { loading } = useAuth()
  const location = useLocation()

  useEffect(() => {
    // Preload critical routes after initial load
    const timer = setTimeout(preloadRoutes, 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999]"
          >
            <LoadingScreen />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col flex-1"
          >
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                {/* Public */}
                <Route path="/"         element={<Landing />} />
                <Route path="/login"    element={<Suspense fallback={<LoadingScreen />}><Navbar /><Login /></Suspense>} />
                <Route path="/register" element={<Suspense fallback={<LoadingScreen />}><Navbar /><Register /></Suspense>} />
                <Route path="/forgot-password" element={<Suspense fallback={<LoadingScreen />}><Navbar /><ForgotPassword /></Suspense>} />
                <Route path="/terms"    element={<Suspense fallback={<LoadingScreen />}><Navbar /><TermsOfService /></Suspense>} />
                <Route path="/privacy"  element={<Suspense fallback={<LoadingScreen />}><Navbar /><PrivacyPolicy /></Suspense>} />

                {/* Protected — wrapped in shared sidebar layout */}
                <Route
                  path="/app"
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index              element={<Navigate to="/app/dashboard" replace />} />
                  <Route path="dashboard"  element={<Dashboard />} />
                  <Route path="detection"  element={<Detection />} />
                  <Route path="results"    element={<Results />} />
                  <Route path="history"    element={<History />} />
                  <Route path="api-keys"   element={<ApiKeyManagement />} />
                  <Route path="profile"    element={<Profile />} />
                  
                  {/* Admin Routes */}
                  <Route path="admin/users"    element={<AdminUsers />} />
                  <Route path="admin/reports"  element={<AdminReports />} />
                  <Route path="admin/settings" element={<AdminSettings />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  )
}
