import api from './api'

export const getPendingWithdrawals = async (page = 1, status = 'pending') => {
  try {
    const response = await api.get('/admin/pending-withdrawals', {
      params: { page, status }
    })
    return response
  } catch (error) {
    throw error
  }
}

export const getWithdrawalDetail = async (withdrawalId) => {
  try {
    const response = await api.get(`/admin/withdrawal-detail/${withdrawalId}`)
    return response
  } catch (error) {
    throw error
  }
}

export const approveWithdrawal = async (withdrawalId) => {
  try {
    const response = await api.post(`/admin/approve-withdrawal/${withdrawalId}`)
    return response
  } catch (error) {
    throw error
  }
}

export const rejectWithdrawal = async (withdrawalId, reason) => {
  try {
    const response = await api.post(`/admin/reject-withdrawal/${withdrawalId}`, { reason })
    return response
  } catch (error) {
    throw error
  }
}