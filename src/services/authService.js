import api from './api'

export const loginAdmin = async (username, password) => {
  try {
    const response = await api.post('/admin/login', {
      username,
      password,
    })
    return response
  } catch (error) {
    throw error
  }
}
