import { createContext, useState, useContext, useEffect } from 'react'
import { loginAdmin } from '../services/authService'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if logged in on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('adminToken')
    const storedAdmin = localStorage.getItem('admin')

    if (storedToken && storedAdmin) {
      setToken(storedToken)
      setAdmin(JSON.parse(storedAdmin))
    }
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    try {
      const response = await loginAdmin(username, password)
      
      if (response.success) {
        const { admin: adminData, token: adminToken } = response.data
        
        localStorage.setItem('adminToken', adminToken)
        localStorage.setItem('admin', JSON.stringify(adminData))
        
        setToken(adminToken)
        setAdmin(adminData)
        
        return { success: true }
      }
      
      return { success: false, message: response.message }
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Нэвтрэхэд алдаа гарлаа' 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('admin')
    setToken(null)
    setAdmin(null)
  }

  const value = {
    admin,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
