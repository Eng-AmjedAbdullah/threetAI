import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getAdminUsers, updateAdminUser, deleteAdminUser } from '../services/api'
import { Users, Search, Trash2, Edit2, Shield, User, MoreVertical } from 'lucide-react'
import { motion } from 'motion/react'
import ConfirmModal from '../components/ConfirmModal'

export default function AdminUsers() {
  const { token } = useAuth()
  const toast = useToast()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editingUser, setEditingUser] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState({ open: false, userId: null })

  useEffect(() => {
    fetchUsers()
  }, [search])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await getAdminUsers(search, token)
      setUsers(data)
    } catch (err) {
      const msg = err.message || 'Failed to load users. Please try again.'
      const title = err.title || 'Load Error'
      toast.error(msg, title)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateAdminUser(userId, { role: newRole }, token)
      toast.success('User role has been updated successfully.', 'Role Updated ✓')
      fetchUsers()
    } catch (err) {
      const msg = err.message || 'Failed to update the user role.'
      const title = err.title || 'Update Failed'
      toast.error(msg, title)
    }
  }

  const handleDelete = async () => {
    const userId = confirmDelete.userId
    try {
      await deleteAdminUser(userId, token)
      toast.success('User has been deleted successfully.', 'User Deleted ✓')
      fetchUsers()
    } catch (err) {
      const msg = err.message || 'Failed to delete the user.'
      const title = err.title || 'Deletion Failed'
      toast.error(msg, title)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="page-title text-2xl sm:text-3xl">User Management</h1>
          <p className="section-subtitle mt-2">Manage system users and their permissions</p>
        </div>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400" />
          <input
            type="text"
            placeholder="Search users..."
            className="input-field pl-10 w-full sm:w-80 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card p-0 overflow-hidden overflow-x-auto border border-navy-100">
        <table className="data-table w-full min-w-max">
          <thead>
            <tr className="bg-navy-50 border-b border-navy-100">
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4">Last Login</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-100">
            {loading ? (
              <tr>
                <td colSpan="5" className="py-20 text-center">
                  <div className="text-navy-400 text-lg font-medium">
                    ...loading
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-16 text-center text-navy-500">
                  <Users size={32} className="mx-auto mb-2 text-navy-300" />
                  <p className="text-sm">No users found</p>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-navy-50 transition-colors"
                >
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-brand-blue/10 flex items-center justify-center text-brand-blue font-semibold text-xs sm:text-sm flex-shrink-0">
                        {user.fullName?.charAt(0)}
                      </div>
                      <div className="hidden sm:block">
                        <div className="font-medium text-navy-900 text-sm">{user.fullName}</div>
                        <div className="text-xs text-navy-400">{user.email}</div>
                      </div>
                      <div className="sm:hidden">
                        <div className="font-medium text-navy-900 text-xs">{user.fullName?.split(' ')[0]}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${
                      user.role === 'admin' 
                        ? 'bg-purple-50 text-purple-700' 
                        : 'bg-blue-50 text-blue-700'
                    }`}>
                      {user.role === 'admin' ? <Shield className="h-2.5 w-2.5" /> : <User className="h-2.5 w-2.5" />}
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="text-xs sm:text-sm text-navy-500">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="text-xs sm:text-sm text-navy-500 hidden sm:table-cell">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                      <select
                        className="text-xs border border-navy-100 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-brand-blue text-navy-700 bg-white"
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        onClick={() => setConfirmDelete({ open: true, userId: user.id })}
                        className="p-1.5 text-navy-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal 
        isOpen={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, userId: null })}
        onConfirm={handleDelete}
        title="Delete User Account"
        message="Are you sure you want to delete this user? All their data and scan history will be permanently removed. This action cannot be undone."
        confirmText="Delete User"
      />
    </div>
  )
}
