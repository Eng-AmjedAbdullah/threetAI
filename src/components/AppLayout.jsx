import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

export default function AppLayout() {
  return (
    <div className="flex flex-col h-screen bg-[#F8FAFF]">
      {/* Header Navbar */}
      <Navbar />
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="w-full">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
