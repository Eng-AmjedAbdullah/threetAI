import { Outlet } from 'react-router-dom'
import { useAuth }  from '../context/AuthContext'
import Navbar from './Navbar'

export default function AppLayout() {
  const { user, logout } = useAuth()
  const initials = user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFF] overflow-hidden">
      <Navbar />
      
      {/* Page content */}
      <main className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
