import api from './api'

export const getPendingKYC = async (page = 1, status = 'pending') => {
  try {
    const response = await api.get('/admin/pending-kyc', {
      params: { page, status }
    })
    return response
  } catch (error) {
    throw error
  }
}

export const getKYCDetail = async (userId) => {
  try {
    const response = await api.get(`/admin/kyc-detail/${userId}`)
    return response
  } catch (error) {
    throw error
  }
}

export const approveKYC = async (userId) => {
  try {
    const response = await api.post(`/admin/approve-kyc/${userId}`)
    return response
  } catch (error) {
    throw error
  }
}

export const rejectKYC = async (userId, reason) => {
  try {
    const response = await api.post(`/admin/reject-kyc/${userId}`, {
      reason
    })
    return response
  } catch (error) {
    throw error
  }
}
