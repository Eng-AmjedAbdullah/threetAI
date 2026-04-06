import { useState } from 'react'
import { User, Mail, Lock, Eye, EyeOff, Save, Shield, Bell,
  AlertCircle, CheckCircle2, LogOut, Trash2, UserCog, Calendar } from 'lucide-react'
import { useAuth }  from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { updateProfile, changePassword, clearHistory } from '../services/api'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import clsx from 'clsx'
import ConfirmModal from '../components/ConfirmModal'

export default function Profile() {
  const { user, logout, refreshUser, token } = useAuth()
  const toast    = useToast()
  const navigate = useNavigate()

  const [profileForm, setProfileForm] = useState({ fullName: user?.fullName || '', email: user?.email || '' })
  const [passForm,    setPassForm]    = useState({ current: '', next: '', confirm: '' })
  const [showPass,    setShowPass]    = useState({})
  const [saving,      setSaving]      = useState(false)
  const [notifs,      setNotifs]      = useState({ scans: true, attacks: true, weekly: false })
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const togglePass = (k) => setShowPass(p => ({ ...p, [k]: !p[k] }))
  const setPF      = (k, v) => setProfileForm(f => ({ ...f, [k]: v }))
  const setPP      = (k, v) => setPassForm(f => ({ ...f, [k]: v }))

  const saveProfile = async () => {
    if (!profileForm.fullName || !profileForm.email) {
      toast.warning('Your name and email address are required.')
      return
    }
    setSaving(true)
    try {
      await updateProfile({ fullName: profileForm.fullName, email: profileForm.email }, token)
      await refreshUser()
      toast.success('Your profile information has been updated successfully.', 'Profile Updated ✓')
    } catch (e) {
      const msg = e.message || 'Failed to update your profile.'
      const title = e.title || 'Update Failed'
      toast.error(msg, title)
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!passForm.current || !passForm.next) { 
      toast.warning('Please fill in all password fields.'); 
      return 
    }
    if (passForm.next !== passForm.confirm)   { 
      toast.warning('The new passwords do not match.'); 
      return 
    }
    if (passForm.next.length < 6)             { 
      toast.warning('Password must be at least 6 characters long.'); 
      return 
    }
    setSaving(true)
    try {
      await changePassword({ currentPassword: passForm.current, newPassword: passForm.next }, token)
      setPassForm({ current: '', next: '', confirm: '' })
      toast.success('Your password has been changed successfully.', 'Password Updated ✓')
    } catch (e) {
      const msg = e.message || 'Failed to change your password.'
      const title = e.title || 'Update Failed'
      toast.error(msg, title)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    toast.info('You have been signed out successfully.')
    navigate('/')
  }

  const handleClearHistory = async () => {
    try {
      await clearHistory(token)
      toast.success('All your scan history has been cleared successfully.', 'History Cleared ✓')
    } catch (e) {
      const msg = e.message || 'Failed to clear your scan history.'
      const title = e.title || 'Error'
      toast.error(msg, title)
    }
  }

  const handleNotifToggle = (key) => {
    setNotifs(n => {
      const next = { ...n, [key]: !n[key] }
      toast.info(
        `${key === 'scans' ? 'Scan completed' : key === 'attacks' ? 'Attack detected' : 'Weekly summary'} notifications ${next[key] ? 'enabled' : 'disabled'}.`,
        'Preferences Updated'
      )
      return next
    })
  }

  const initials = user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="pb-2">
        <h1 className="page-title">Profile & Settings</h1>
        <p className="section-subtitle mt-2">Manage your account information and preferences.</p>
      </div>

      {/* Profile hero */}
      <div className="card bg-gradient-to-br from-navy-900 to-navy-700 text-white p-8">
        <div className="flex flex-col sm:flex-row sm:items-start gap-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center text-2xl font-extrabold shadow-glow flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-extrabold">{user?.fullName}</h2>
            <p className="text-white/70 text-sm mt-1">{user?.email}</p>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 border border-white/15 rounded-full text-xs font-semibold capitalize">
                <UserCog size={12} /> {user?.role || 'analyst'}
              </span>
              {user?.createdAt && (
                <span className="flex items-center gap-1.5 text-xs text-white/60">
                  <Calendar size={11} />
                  Joined {format(new Date(user.createdAt), 'MMM yyyy')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit profile */}
      <div className="card space-y-6">
        <h3 className="font-bold text-navy-900 flex items-center gap-2 text-lg">
          <User size={17} className="text-brand-blue" /> Personal Information
        </h3>
        <div className="space-y-5">
          <div>
            <label className="label">Full Name</label>
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
              <input type="text" className="input-field pl-10" value={profileForm.fullName}
                onChange={e => setPF('fullName', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Email Address</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
              <input type="email" className="input-field pl-10" value={profileForm.email}
                onChange={e => setPF('email', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Role</label>
            <div className="relative">
              <Shield size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
              <input type="text" className="input-field pl-10 bg-navy-50 cursor-not-allowed"
                value={user?.role || 'analyst'} disabled />
            </div>
            <p className="text-xs text-navy-400 mt-1">Role is assigned by an administrator.</p>
          </div>
          <div className="flex justify-end pt-4">
            <button onClick={saveProfile} disabled={saving} className="btn-primary gap-2">
              {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={15} />}
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Change password */}
      <div className="card space-y-6">
        <h3 className="font-bold text-navy-900 flex items-center gap-2 text-lg">
          <Lock size={17} className="text-brand-blue" /> Change Password
        </h3>
        <div className="space-y-5">
          {[
            { key: 'current', label: 'Current Password',   placeholder: '••••••••' },
            { key: 'next',    label: 'New Password',        placeholder: 'Min. 6 characters' },
            { key: 'confirm', label: 'Confirm New Password',placeholder: 'Repeat new password' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="label">{label}</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
                <input type={showPass[key] ? 'text' : 'password'} className="input-field pl-10 pr-10"
                  placeholder={placeholder} value={passForm[key]}
                  onChange={e => setPP(key, e.target.value)} />
                <button type="button" onClick={() => togglePass(key)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-700 transition-colors">
                  {showPass[key] ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          ))}
          <div className="flex justify-end pt-4">
            <button onClick={handleChangePassword} disabled={saving} className="btn-primary gap-2">
              {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Lock size={15} />}
              Update Password
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="card space-y-6">
        <h3 className="font-bold text-navy-900 flex items-center gap-2 text-lg">
          <Bell size={17} className="text-brand-blue" /> Notification Preferences
        </h3>
        <div className="space-y-3">
          {[
            { key: 'scans',   label: 'Scan Completed',   desc: 'Notify when a detection scan finishes' },
            { key: 'attacks', label: 'Attack Detected',   desc: 'Alert when an attack is detected' },
            { key: 'weekly',  label: 'Weekly Summary',    desc: 'Receive a weekly digest of your scans' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between p-3.5 bg-navy-50 rounded-xl border border-navy-100/50 hover:bg-navy-100/50 transition-colors">
              <div>
                <p className="font-semibold text-navy-800 text-sm">{label}</p>
                <p className="text-xs text-navy-400 mt-0.5">{desc}</p>
              </div>
              <button onClick={() => handleNotifToggle(key)}
                className={clsx('w-11 h-6 rounded-full transition-all duration-300 relative flex-shrink-0',
                  notifs[key] ? 'bg-brand-blue' : 'bg-navy-200')}>
                <span className={clsx('absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300')}
                  style={{ left: notifs[key] ? '22px' : '2px' }} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="card border-red-100 space-y-6">
        <h3 className="font-bold text-red-700 flex items-center gap-2 text-lg">
          <AlertCircle size={17} /> Danger Zone
        </h3>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <button onClick={() => setShowLogoutConfirm(true)} className="btn-ghost w-fit px-6 border border-navy-200 gap-2 text-navy-700">
            <LogOut size={15} /> Sign Out
          </button>
          <button onClick={() => setShowClearConfirm(true)}
            className="btn-ghost w-fit px-6 border border-red-200 text-red-600 hover:bg-red-50 gap-2">
            <Trash2 size={15} /> Clear Scan History
          </button>
        </div>
      </div>

      <ConfirmModal 
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearHistory}
        title="Clear All History"
        message="Are you sure you want to delete all your scan history? This action is permanent and cannot be undone."
        confirmText="Delete History"
      />

      <ConfirmModal 
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Sign Out"
        message="Are you sure you want to sign out of your account?"
        confirmText="Sign Out"
        type="danger"
      />
    </div>
  )
}
