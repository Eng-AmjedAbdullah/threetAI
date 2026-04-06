import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, Eye, EyeOff, Shield, ArrowRight, AlertCircle, CheckCircle2, UserCog, ArrowLeft, ChevronRight } from 'lucide-react'
import { useAuth }  from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

function PasswordStrength({ password }) {
  const checks = [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'Contains a number',     ok: /\d/.test(password) },
    { label: 'Contains uppercase',    ok: /[A-Z]/.test(password) },
  ]
  const score  = checks.filter(c => c.ok).length
  const colors = ['bg-red-400', 'bg-amber-400', 'bg-emerald-400']

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < score ? colors[score - 1] : 'bg-navy-100'}`} />
        ))}
      </div>
      {password && (
        <div className="space-y-1">
          {checks.map(c => (
            <div key={c.label} className={`flex items-center gap-1.5 text-xs ${c.ok ? 'text-emerald-600' : 'text-navy-400'}`}>
              <CheckCircle2 size={11} className={c.ok ? 'text-emerald-500' : 'text-navy-300'} />{c.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Register() {
  const { register } = useAuth()
  const toast        = useToast()
  const navigate     = useNavigate()

  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '', terms: false })
  const [showPass, setShowPass] = useState(false)
  const [showConf, setShowConf] = useState(false)
  const [loading,  setLoading]  = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.fullName || !form.email || !form.password) {
      toast.warning('Please fill in all required fields.')
      return
    }
    if (form.password !== form.confirm) {
      toast.warning('The passwords you entered do not match. Please try again.')
      return
    }
    if (form.password.length < 6) {
      toast.warning('Password must be at least 6 characters long.')
      return
    }
    if (!form.terms) {
      toast.warning('You must agree to the terms and conditions to continue.')
      return
    }

    setLoading(true)
    try {
      await register({ fullName: form.fullName, email: form.email, password: form.password })
      toast.success('Your account has been created successfully!', 'Welcome to ThreatGuardAI 🎉')
      navigate('/app/dashboard')
    } catch (err) {
      const msg = err.message || 'Registration failed. Please try again.'
      const title = err.title || 'Registration Failed'
      setError(msg)
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
        <div className="relative text-center max-w-md">
                          <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-32 h-32 rounded-3xl bg-white shadow-card-lg flex items-center justify-center mb-8 animate-float overflow-hidden p-4">
                    <img src="/logo.png" alt="ThreatGuardAI" className="w-full h-full object-contain" />
                  </div>
                </div>
          <h1 className="text-4xl font-extrabold text-white mb-4 leading-tight">Join Us Today</h1>
          <p className="text-white/70 text-lg leading-relaxed mb-8">
            Create your account and start detecting network intrusions with AI-powered precision.
          </p>
          <div className="space-y-3 text-left">
            {[
              { icon: Shield, title: 'Instant Detection', desc: 'Run your first scan in under 2 minutes' },
              { icon: CheckCircle2, title: 'Free Account', desc: 'No credit card required to get started' },
              { icon: Lock, title: 'Secure Access', desc: 'Enterprise-grade encryption for your data' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3 bg-white/10 border border-white/10 rounded-2xl px-4 py-3">
                <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{title}</p>
                  <p className="text-white/60 text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 bg-[#F8FAFF]">
        
        <div className="w-full max-w-[480px] bg-white p-6 sm:p-10 rounded-[2.5rem] border border-navy-100/40 shadow-[0_20px_50px_rgba(13,27,62,0.05)] animate-fade-up">
          <div className="mb-8 text-center sm:text-left">
            <h2 className="text-3xl font-extrabold text-navy-900 mb-3 tracking-tight">Create Account</h2>
            <p className="text-navy-500 text-sm leading-relaxed">Join us to start monitoring your network with AI-powered intrusion detection.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-navy-700 uppercase tracking-wider ml-1">Full Name</label>
              <div className="relative group">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-300 group-focus-within:text-brand-blue transition-colors pointer-events-none" />
                <input type="text" className="input-field pl-12 h-12 bg-navy-50/30 border-navy-100 focus:bg-white transition-all" placeholder="Ahad Ali"
                  value={form.fullName} onChange={e => set('fullName', e.target.value)} autoComplete="name" />
              </div>
            </div>
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
                  placeholder="Min. 8 characters" value={form.password}
                  onChange={e => set('password', e.target.value)} autoComplete="new-password" />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-navy-300 hover:text-navy-600 transition-colors">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {form.password && <PasswordStrength password={form.password} />}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-navy-700 uppercase tracking-wider ml-1">Confirm Password</label>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-300 group-focus-within:text-brand-blue transition-colors pointer-events-none" />
                <input type={showConf ? 'text' : 'password'} className="input-field pl-12 pr-12 h-12 bg-navy-50/30 border-navy-100 focus:bg-white transition-all"
                  placeholder="Repeat password" value={form.confirm}
                  onChange={e => set('confirm', e.target.value)} autoComplete="new-password" />
                <button type="button" onClick={() => setShowConf(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-navy-300 hover:text-navy-600 transition-colors">
                  {showConf ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {form.confirm && form.password !== form.confirm && (
                <p className="text-xs text-red-500 mt-1 ml-1 font-medium">Passwords do not match.</p>
              )}
            </div>
            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input type="checkbox" checked={form.terms} onChange={e => set('terms', e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-navy-200 text-brand-blue focus:ring-brand-blue cursor-pointer" />
                <span className="text-sm text-navy-600 leading-relaxed select-none">
                  I agree to the{' '}<Link to="/terms" className="text-brand-blue font-bold hover:underline">Terms of Service</Link>
                  {' '}and{' '}<Link to="/privacy" className="text-brand-blue font-bold hover:underline">Privacy Policy</Link>
                </span>
              </label>
            </div>
            <div className="pt-4 flex justify-center">
              <button type="submit" disabled={loading} className="btn-primary w-full sm:w-[60%] py-2.5 sm:py-3.5 text-xs sm:text-base font-bold shadow-glow-sm hover:shadow-glow transition-all whitespace-nowrap">
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <span className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="hidden sm:inline">Creating...</span>
                    <span className="sm:hidden">Signing up...</span>
                  </span>
                ) : (<span className="flex items-center gap-1 sm:gap-2 justify-center"><span>Create Account</span> <ArrowRight size={14} className="sm:size-4" /></span>)}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-navy-50">
            <p className="text-center text-sm text-navy-500">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-brand-blue hover:text-blue-700 transition-colors">Sign in</Link>
            </p>
            <Link to="/" className="mt-4 text-sm font-bold text-navy-500 hover:text-navy-900 transition-colors flex items-center justify-center gap-2">
              <ArrowLeft size={16} /> Back
            </Link>
          </div>
        </div>


      </div>
    </div>
  )
}
