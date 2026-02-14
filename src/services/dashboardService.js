import api from './api'

export const getDashboardStats = async () => {
  try {
    const response = await api.get('/admin/dashboard')
    return response
  } catch (error) {
    throw error
  }
}
