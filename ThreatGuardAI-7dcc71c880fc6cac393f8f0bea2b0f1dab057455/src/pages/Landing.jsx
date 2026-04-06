import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Shield, Zap, BarChart3, Lock, ChevronRight, CheckCircle2,
  ArrowRight, Activity, Globe, Database, AlertTriangle, TrendingUp,
  Mail, Twitter, Linkedin, Github, Facebook, Send, Clock
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import { getStats } from '../services/api'
import { format } from 'date-fns'

const FEATURES = [
  {
    icon: Zap,
    title: 'Instant Classification',
    desc: 'Analyze network traffic with sub-millisecond latency using our optimized detection engine.',
    color: 'from-amber-400 to-orange-500',
    bg: 'bg-amber-50',
  },
  {
    icon: BarChart3,
    title: 'Deep In-Sight Reports',
    desc: 'Get granular breakdowns of every scan, including confidence scores and feature importance rankings.',
    color: 'from-emerald-400 to-teal-500',
    bg: 'bg-emerald-50',
  },
  {
    icon: Globe,
    title: 'Bulk Data Processing',
    desc: 'Process large-scale network captures via CSV upload for comprehensive infrastructure auditing.',
    color: 'from-cyan-400 to-blue-500',
    bg: 'bg-cyan-50',
  },
  {
    icon: Database,
    title: 'Persistent Audit Trail',
    desc: 'Maintain a secure, searchable history of all past detections for compliance and forensic analysis.',
    color: 'from-violet-400 to-purple-600',
    bg: 'bg-violet-50',
  },
  {
    icon: Shield,
    title: 'Adaptive Protection',
    desc: 'Designed to identify diverse attack vectors including DoS, Probing, R2L, and U2R attempts.',
    color: 'from-brand-blue to-brand-purple',
    bg: 'bg-blue-50',
  },
  {
    icon: Lock,
    title: 'Enterprise Security',
    desc: 'Role-based access control and encrypted sessions ensure your sensitive data remains private.',
    color: 'from-rose-400 to-pink-600',
    bg: 'bg-rose-50',
  },
]

const CHECKLIST = [
  'High-precision binary classification',
  'Real-time confidence scoring',
  'Detailed feature importance',
  'Batch CSV processing support',
  'Secure audit history',
  'Encrypted data transmission',
]

export default function Landing() {
  const { user, token } = useAuth()
  const [stats, setStats] = useState(null)
  const [loadingStats, setLoadingStats] = useState(false)

  const footerLinks = user?.role === 'admin' 
    ? [
        { name: 'Admin Dashboard', path: '/app/dashboard' },
        { name: 'User Management', path: '/app/admin/users' },
        { name: 'System Reports', path: '/app/admin/reports' },
        { name: 'Security Settings', path: '/app/admin/settings' },
        { name: 'My Profile', path: '/app/profile' }
      ]
    : user?.role === 'user'
    ? [
        { name: 'Dashboard', path: '/app/dashboard' },
        { name: 'Run Detection', path: '/app/detection' },
        { name: 'Scan History', path: '/app/history' },
        { name: 'My Profile', path: '/app/profile' },
        { name: 'Support', path: '#contact' }
      ]
    : [
        { name: 'Home', path: '#home' },
        { name: 'Features', path: '#features' },
        { name: 'How It Works', path: '#how-it-works' },
        { name: 'About', path: '#about' },
        { name: 'Contact', path: '#contact' }
      ]

  useEffect(() => {
    if (user && token) {
      setLoadingStats(true)
      getStats(token)
        .then(setStats)
        .catch(err => console.error('Failed to load landing stats:', err))
        .finally(() => setLoadingStats(false))
    }
  }, [user, token])
  return (
    <div className="min-h-screen bg-[#F8FAFF] overflow-x-hidden font-display">
      <Navbar />
      <section id="home" className="relative pt-10 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-mesh-gradient pointer-events-none" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-brand-blue/8 to-brand-purple/6 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-brand-light/6 to-transparent blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue/8 border border-brand-blue/20 rounded-full text-brand-blue text-xs font-semibold mb-6">
                <span className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-pulse" />
                Next-Generation Network Security
              </div>

              <h1 className="text-5xl font-extrabold text-navy-900 leading-tight tracking-tight mb-6">
                Intelligent
                <br />
                <span className="text-gradient">Threat</span>
                <br />
                Neutralization
              </h1>

              <p className="text-lg text-navy-500 leading-relaxed mb-8 max-w-lg">
                ThreatGuardAI provides a robust, AI-driven layer of defense for your network, identifying malicious intrusions with industry-leading precision.
              </p>

              <div className="flex justify-start mb-10">
                {user ? (
                  <Link to="/app/dashboard" className="btn-primary text-base px-6 py-3">
                    Go to Dashboard <ArrowRight size={16} />
                  </Link>
                ) : (
                  <div className="flex flex-wrap justify-start gap-3">
                    <Link to="/register" className="btn-primary text-base px-6 py-3">
                      Start Detecting Free <ArrowRight size={16} />
                    </Link>
                    <Link to="/login" className="btn-secondary text-base px-6 py-3">
                      Sign In
                    </Link>
                  </div>
                )}
              </div>

              {/* Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CHECKLIST.map(item => (
                  <div key={item} className="flex items-center gap-2 text-sm text-navy-600">
                    <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — System Visual */}
            <div className="relative animate-fade-up animate-delay-200 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md aspect-square rounded-[3rem] bg-gradient-to-br from-brand-blue/10 to-brand-purple/10 border border-navy-100/60 flex items-center justify-center p-12 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,white,transparent_70%)] opacity-50" />
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-32 h-32 rounded-3xl bg-white shadow-card-lg flex items-center justify-center mb-8 animate-float overflow-hidden p-4">
                    <img src="/logo.png" alt="ThreatGuardAI" className="w-full h-full object-contain" />
                  </div>
                  <h3 className="text-2xl font-bold text-navy-900 mb-4">Secure by Design</h3>
                  <p className="text-navy-500 text-sm leading-relaxed">
                    Our architecture is optimized for high-throughput network environments where speed and accuracy are paramount.
                  </p>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute top-10 left-10 w-4 h-4 rounded-full bg-brand-blue/20 animate-pulse" />
                <div className="absolute bottom-20 right-10 w-6 h-6 rounded-full bg-brand-purple/20 animate-pulse delay-700" />
                <div className="absolute top-1/2 left-1/4 w-2 h-2 rounded-full bg-emerald-400/30 animate-ping" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── User Stats (Conditional) ──────────────────────── */}
      {user && token && (
        <section className="py-12 bg-white border-b border-navy-100/60 animate-fade-in">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col items-center text-center gap-6 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-navy-900">Welcome back, {user.fullName?.split(' ')[0]}</h2>
                <p className="text-navy-500 text-sm">Your real-time security overview.</p>
              </div>
            </div>

            {loadingStats ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-navy-50 rounded-2xl animate-pulse border border-navy-100" />
                ))}
              </div>
            ) : stats ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                  <p className="text-xs font-bold text-brand-blue uppercase tracking-wider mb-1">Total Scans</p>
                  <p className="text-3xl font-black text-navy-900">{stats.total}</p>
                </div>
                <div className="bg-red-50/50 p-5 rounded-2xl border border-red-100">
                  <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">Attacks Detected</p>
                  <p className="text-3xl font-black text-red-700">{stats.attacks}</p>
                </div>
                <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100">
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Safe Traffic</p>
                  <p className="text-3xl font-black text-emerald-700">{stats.normals}</p>
                </div>
                <div className="bg-violet-50/50 p-5 rounded-2xl border border-violet-100">
                  <p className="text-xs font-bold text-violet-600 uppercase tracking-wider mb-1">Avg. Confidence</p>
                  <p className="text-3xl font-black text-violet-700">{stats.avgConf}%</p>
                </div>
              </div>
            ) : (
              <div className="bg-navy-50 p-8 rounded-2xl border border-navy-100 text-center">
                <p className="text-navy-500 text-sm">No detection data available yet. Start your first scan to see real results here.</p>
                <Link to="/app/detection" className="text-brand-blue font-bold text-sm mt-2 inline-block hover:underline">Start Scanning Now</Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── About Section ─────────────────────────────────── */}
      <section id="about" className="py-12 bg-[#F8FAFF]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-brand-blue/20 to-brand-purple/20 blur-2xl rounded-full opacity-50" />
                <div className="relative bg-white p-8 rounded-3xl border border-navy-100 shadow-sm">
                  <h3 className="text-2xl font-bold text-navy-900 mb-4">Built on Proven Technology</h3>
                  <p className="text-navy-600 leading-relaxed mb-6">
                    ThreatGuardAI is built upon the foundation of the NSL-KDD dataset, a refined version of the classic KDD Cup 99 dataset. This ensures our models are trained on diverse and relevant network traffic patterns, including DoS, R2L, U2R, and Probing attacks.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-brand-blue/10 flex items-center justify-center mt-1">
                        <CheckCircle2 size={14} className="text-brand-blue" />
                      </div>
                      <div>
                        <p className="font-bold text-navy-900 text-sm">Random Forest Classifier</p>
                        <p className="text-xs text-navy-500">Utilizing ensemble learning for high-precision classification.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-brand-blue/10 flex items-center justify-center mt-1">
                        <CheckCircle2 size={14} className="text-brand-blue" />
                      </div>
                      <div>
                        <p className="font-bold text-navy-900 text-sm">42-Feature Analysis</p>
                        <p className="text-xs text-navy-500">Deep inspection of connection durations, protocol types, and service flags.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <span className="text-xs font-bold text-brand-blue uppercase tracking-widest">About the System</span>
              <h2 className="text-4xl font-extrabold text-navy-900 mt-2 mb-6">Intelligence Driven Security</h2>
              <p className="text-navy-500 leading-relaxed mb-6">
                Our mission is to democratize advanced network security. By combining academic research with modern web technologies, we provide a platform that is both powerful for experts and accessible for newcomers.
              </p>
              <p className="text-navy-500 leading-relaxed">
                Whether you are analyzing a single suspicious connection or auditing thousands of records from a network capture, ThreatGuardAI provides the clarity and confidence needed to secure your digital assets.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────── */}
      <section id="features" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-brand-blue uppercase tracking-widest">Core Capabilities</span>
            <h2 className="text-4xl font-extrabold text-navy-900 mt-2 mb-4">Enterprise-Grade Protection</h2>
            <p className="text-navy-500 max-w-xl mx-auto">Our platform provides a comprehensive suite of tools for modern network security monitoring and threat analysis.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="card-hover group">
                <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-sm`}>
                    <Icon size={16} className="text-white" />
                  </div>
                </div>
                <h3 className="font-bold text-navy-900 mb-2">{title}</h3>
                <p className="text-sm text-navy-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────── */}
      <section id="how-it-works" className="py-12 bg-[#F8FAFF] border-y border-navy-100/60">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-brand-blue uppercase tracking-widest">Process</span>
            <h2 className="text-4xl font-extrabold text-navy-900 mt-2 mb-4">Streamlined Threat Analysis</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-[calc(33%+16px)] right-[calc(33%+16px)] h-0.5 bg-gradient-to-r from-brand-blue/40 to-brand-purple/40" />
            {[
              { step: '01', title: 'Input Network Data', desc: 'Enter 42 network features manually or upload a CSV file for batch analysis.', icon: Database },
              { step: '02', title: 'AI Classifies Traffic', desc: 'Our Random Forest model processes every feature and outputs a prediction with confidence score.', icon: Activity },
              { step: '03', title: 'View & Act on Results', desc: 'See verdicts, feature importance, and save results to your searchable audit history.', icon: Shield },
            ].map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="text-center relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center mx-auto mb-5 shadow-glow">
                  <Icon size={26} className="text-white" />
                </div>
                <div className="absolute top-0 right-0 text-6xl font-extrabold text-navy-50 -z-10 leading-none">{step}</div>
                <h3 className="font-bold text-navy-900 mb-2">{title}</h3>
                <p className="text-sm text-navy-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────── */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-hero-gradient rounded-3xl p-10 relative overflow-hidden shadow-glow">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_50%,white,transparent_60%)]" />
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mx-auto mb-6 shadow-card-lg overflow-hidden p-3">
                <img src="/logo.png" alt="ThreatGuardAI" className="w-full h-full object-contain" />
              </div>
              <h2 className="text-4xl font-extrabold text-white mb-4">Secure Your Infrastructure</h2>
              <p className="text-white/75 mb-8 max-w-lg mx-auto">Join security professionals worldwide using ThreatGuardAI for intelligent traffic analysis.</p>
              <Link to="/register" className="inline-flex items-center gap-2 bg-white text-navy-900 font-bold px-8 py-4 rounded-2xl hover:bg-navy-50 transition-all shadow-lg text-base">
                Get Started Now <ChevronRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact Us ────────────────────────────────────── */}
      <section id="contact" className="py-12 bg-white border-y border-navy-100/60">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <span className="text-xs font-bold text-brand-blue uppercase tracking-widest">Contact Us</span>
            <h2 className="text-4xl font-extrabold text-navy-900 mt-2">Get in Touch</h2>
          </div>

          <div className="bg-[#F8FAFF] rounded-3xl p-8 border border-navy-100 shadow-sm">
            <form className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-navy-700 mb-1.5 block">Full Name</label>
                    <input type="text" className="input-field" placeholder="Ahad Ali" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-navy-700 mb-1.5 block">Email Address</label>
                    <input type="email" className="input-field" placeholder="ahad@example.com" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-navy-700 mb-1.5 block">Subject</label>
                  <input type="text" className="input-field" placeholder="How can we help?" />
                </div>
                <div>
                  <label className="text-xs font-bold text-navy-700 mb-1.5 block">Message</label>
                  <textarea className="input-field min-h-[120px] py-3" placeholder="Tell us more about your needs..."></textarea>
                </div>
                <div className="flex justify-center pt-2">
                  <button type="button" className="btn-primary w-[60%] px-8 py-4 text-base mx-auto">
                    Send Message <Send size={16} />
                  </button>
                </div>
              </form>
            </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="bg-navy-900 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            {/* Brand */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold tracking-tight text-white">
                  ThreatGuard<span className="text-brand-blue">AI</span>
                </span>
              </div>
              <p className="text-white/60 text-sm leading-relaxed max-w-sm">
                Next-generation AI intrusion detection system. Protecting enterprise networks with machine learning precision.
              </p>
              <div className="flex gap-4">
                {[Twitter, Linkedin, Github, Facebook].map((Icon, i) => (
                  <a key={i} href="#" className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-bold mb-6">Quick Links</h4>
              <ul className="grid grid-cols-2 gap-x-8 gap-y-4">
                {footerLinks.map(link => (
                  <li key={link.name}>
                    {link.path.startsWith('#') ? (
                      <a href={link.path} className="text-white/60 hover:text-white text-sm transition-colors">{link.name}</a>
                    ) : (
                      <Link to={link.path} className="text-white/60 hover:text-white text-sm transition-colors">{link.name}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/40 text-sm">© 2026 ThreatGuardAI. All rights reserved.</p>
            <div className="flex gap-8">
              <Link to="/privacy" className="text-white/40 hover:text-white text-sm transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="text-white/40 hover:text-white text-sm transition-colors">Terms of Service</Link>
              <a href="#" className="text-white/40 hover:text-white text-sm transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
