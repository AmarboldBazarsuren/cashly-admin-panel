import { FiBell, FiUser } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'

const Header = () => {
  const { admin } = useAuth()

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between">
        {/* Page Title - can be dynamic */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <FiBell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Admin Profile */}
          <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              <FiUser className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{admin?.username || 'Admin'}</p>
              <p className="text-xs text-gray-500">{admin?.role || 'Administrator'}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
