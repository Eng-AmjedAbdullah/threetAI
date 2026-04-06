import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Shield, ArrowLeft, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useToast } from '../context/ToastContext'

export default function ForgotPassword() {
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) {
      toast.warning('Please enter your email address.')
      return
    }
    setLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      setSubmitted(true)
      toast.success('Password reset instructions sent to your email.', 'Check your inbox')
    } catch (err) {
      toast.error('Failed to send reset email. Please try again.')
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
            Account Recovery
          </h1>
          <p className="text-white/70 text-lg leading-relaxed">
            Don't worry, it happens to the best of us. We'll help you get back into your account in no time.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 bg-[#F8FAFF]">

        
        <div className="w-full max-w-[480px] bg-white p-6 sm:p-10 rounded-[2.5rem] border border-navy-100/40 shadow-[0_20px_50px_rgba(13,27,62,0.05)] animate-fade-up">
          {!submitted ? (
            <>
              <div className="mb-10 text-center sm:text-left">
                <h2 className="text-3xl font-extrabold text-navy-900 mb-3 tracking-tight">Forgot Password?</h2>
                <p className="text-navy-500 text-sm leading-relaxed">Enter the email address associated with your account and we'll send you instructions to reset your password.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-navy-700 uppercase tracking-wider ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-300 group-focus-within:text-brand-blue transition-colors pointer-events-none" />
                      <input 
                        type="email" 
                        className="input-field pl-12 h-12 bg-navy-50/30 border-navy-100 focus:bg-white transition-all" 
                        placeholder="ahad@example.com"
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        autoComplete="email" 
                      />
                  </div>
                </div>
                
                <div className="pt-2 flex justify-center">
                  <button type="submit" disabled={loading} className="btn-primary w-full sm:w-[60%] py-2.5 sm:py-3.5 text-xs sm:text-base font-bold shadow-glow-sm hover:shadow-glow transition-all whitespace-nowrap">
                    {loading ? (
                      <span className="flex items-center gap-2 justify-center">
                        <span className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span className="hidden sm:inline">Sending...</span>
                        <span className="sm:hidden">Sending</span>
                      </span>
                    ) : (<span className="flex items-center gap-1 sm:gap-2 justify-center"><span>Send Instructions</span> <ArrowRight size={14} className="sm:size-5" /></span>)}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-emerald-500">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-3xl font-extrabold text-navy-900 mb-3 tracking-tight">Check Your Email</h2>
              <p className="text-navy-500 text-sm leading-relaxed mb-8">
                We've sent password reset instructions to <span className="font-bold text-navy-900">{email}</span>. Please check your inbox and follow the link provided.
              </p>
              <button 
                onClick={() => setSubmitted(false)} 
                className="text-sm font-bold text-brand-blue hover:text-blue-700 transition-colors"
              >
                Didn't receive the email? Try again
              </button>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-navy-50">
            <Link to="/login" className="text-sm font-bold text-navy-500 hover:text-navy-900 transition-colors flex items-center justify-center gap-2">
              <ArrowLeft size={16} /> Back to Sign In
            </Link>
          </div>
        </div>


      </div>
    </div>
  )
}
