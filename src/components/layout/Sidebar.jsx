import { NavLink } from 'react-router-dom'
import { 
  FiHome, 
  FiUsers, 
  FiFileText, 
  FiDollarSign,
  FiCreditCard,
  FiLogOut
} from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'

const Sidebar = () => {
  const { logout } = useAuth()

  const menuItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/kyc', icon: FiFileText, label: 'KYC Баталгаажуулалт' },
    { path: '/loans', icon: FiDollarSign, label: 'Зээлийн хүсэлт' },
    { path: '/withdrawals', icon: FiCreditCard, label: 'Мөнгө авалт' },
    { path: '/users', icon: FiUsers, label: 'Хэрэглэгчид' },
  ]

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-dark-900 text-white flex flex-col">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-dark-800">
        <h1 className="text-2xl font-bold text-primary-400">Cashly Admin</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-dark-800'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-4 py-4 border-t border-dark-800">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-300 hover:bg-dark-800 transition-colors"
        >
          <FiLogOut className="w-5 h-5" />
          <span className="font-medium">Гарах</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
