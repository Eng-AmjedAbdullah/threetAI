import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Shield, ArrowRight, AlertCircle, ArrowLeft, ChevronRight } from 'lucide-react'
import { useAuth }  from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Login() {
  const { login }   = useAuth()
  const toast       = useToast()
  const navigate    = useNavigate()

  const [form,     setForm]     = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      toast.warning('Please fill in all fields.')
      return
    }
    setLoading(true)
    try {
      const u = await login(form.email, form.password)
      toast.success(`Welcome back, ${u.fullName?.split(' ')[0]}! 👋`, 'Signed In')
      navigate('/app/dashboard')
    } catch (err) {
      const msg = err.message || 'Invalid email or password.'
      const title = err.title || 'Sign In Failed'
      toast.error(msg, title)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFF] flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 bg-hero-gradient flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_40%,white,transparent_60%)]" />
        <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-white/5 blur-2xl" />
        <div className="relative text-center max-w-md">
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-32 h-32 rounded-3xl bg-white shadow-card-lg flex items-center justify-center mb-8 animate-float overflow-hidden p-4">
                    <img src="/logo.png" alt="ThreatGuardAI" className="w-full h-full object-contain" />
                  </div>
                </div>
          <h1 className="text-4xl font-extrabold text-white mb-4 leading-tight">
            Welcome Back
          </h1>
          <p className="text-white/70 text-lg leading-relaxed">
            Your AI-powered network intrusion detection system. Sign in to monitor, analyze, and protect.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {['99.2% Accuracy', 'Real-Time Detection', 'Batch Analysis', 'Audit Trail'].map(f => (
              <span key={f} className="px-3 py-1.5 bg-white/10 border border-white/15 rounded-full text-white/80 text-xs font-medium">{f}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 bg-[#F8FAFF]">
        {/* Logo Container */}
        {/* <div className="mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-white border border-navy-100/40 shadow-sm flex items-center justify-center overflow-hidden p-1.5">
            <img src="/logo.png" alt="ThreatGuardAI" className="w-full h-full object-contain" />
          </div>
        </div> */}
        
        <div className="w-full max-w-[460px] bg-white p-6 sm:p-10 rounded-[2.5rem] border border-navy-100/40 shadow-[0_20px_50px_rgba(13,27,62,0.05)] animate-fade-up">
          <div className="mb-6 sm:mb-8 text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 mb-2 sm:mb-3 tracking-tight">Welcome Back</h2>
            <p className="text-navy-500 text-xs sm:text-sm leading-relaxed">Securely sign in to your dashboard to monitor network activity.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-navy-700 uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-300 group-focus-within:text-brand-blue transition-colors pointer-events-none" />
                <input type="email" className="input-field pl-12 h-12 bg-navy-50/30 border-navy-100 focus:bg-white transition-all" placeholder="ahad@example.com"
                  value={form.email} onChange={e => set('email', e.target.value)} autoComplete="email" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-navy-700 uppercase tracking-wider ml-1">Password</label>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-300 group-focus-within:text-brand-blue transition-colors pointer-events-none" />
                <input type={showPass ? 'text' : 'password'} className="input-field pl-12 pr-12 h-12 bg-navy-50/30 border-navy-100 focus:bg-white transition-all"
                  placeholder="••••••••" value={form.password}
                  onChange={e => set('password', e.target.value)} autoComplete="current-password" />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-navy-300 hover:text-navy-600 transition-colors">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="remember" className="w-4 h-4 rounded border-navy-200 text-brand-blue focus:ring-brand-blue cursor-pointer" />
                <label htmlFor="remember" className="text-sm font-bold text-brand-blue hover:text-blue-700 transition-colors cursor-pointer select-none">Remember me</label>
              </div>
              <Link to="/forgot-password" title="Forgot password?" className="text-sm font-bold text-brand-blue hover:text-blue-700 transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="pt-2 flex justify-center">
              <button type="submit" disabled={loading} className="btn-primary w-full sm:w-[60%] py-2.5 sm:py-3.5 text-xs sm:text-base font-bold shadow-glow-sm hover:shadow-glow transition-all whitespace-nowrap">
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <span className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="hidden sm:inline">Authenticating...</span>
                    <span className="sm:hidden">Signing in...</span>
                  </span>
                ) : (<span className="flex items-center gap-1 sm:gap-2 justify-center"><span>Sign In</span> <ArrowRight size={14} className="sm:size-4" /></span>)}
              </button>
            </div>
          </form>

          <div className="mt-2 pt-4 border-t border-navy-50">
            <p className="text-center text-sm text-navy-500">
              New to ThreatGuardAI?{' '}
              <Link to="/register" className="font-bold text-brand-blue hover:text-blue-700 transition-colors">Create account</Link>
            </p>
            <Link to="/" className="mt-4 text-sm font-bold text-navy-500 hover:text-navy-900 transition-colors flex items-center justify-center gap-2">
              <ArrowLeft size={16} /> Back to Home
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
