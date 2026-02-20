import api from './api'

export const getAllUsers = async (page = 1, search = '', status = '', kycStatus = '') => {
  try {
    const params = { page }
    if (search) params.search = search
    if (status) params.status = status
    if (kycStatus) params.kycStatus = kycStatus

    const response = await api.get('/admin/users', { params })
    return response
  } catch (error) {
    throw error
  }
}

export const getUserDetail = async (userId) => {
  try {
    const response = await api.get(`/admin/user/${userId}`)
    return response
  } catch (error) {
    throw error
  }
}

export const blockUser = async (userId, reason = '') => {
  try {
    const response = await api.put(`/admin/user/${userId}/block`, { reason })
    return response
  } catch (error) {
    throw error
  }
}

export const unblockUser = async (userId) => {
  try {
    const response = await api.put(`/admin/user/${userId}/unblock`)
    return response
  } catch (error) {
    throw error
  }
}

export const setCreditLimit = async (userId, creditLimit) => {
  try {
    const response = await api.post(`/admin/set-credit-limit/${userId}`, { creditLimit })
    return response
  } catch (error) {
    throw error
  }
}