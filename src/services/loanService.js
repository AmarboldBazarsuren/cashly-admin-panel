import api from './api'

export const getPendingLoans = async (page = 1, status = 'pending') => {
  try {
    const response = await api.get('/admin/pending-loans', {
      params: { page, status }
    })
    return response
  } catch (error) {
    throw error
  }
}

export const getActiveLoans = async (page = 1) => {
  try {
    const response = await api.get('/admin/active-loans', {
      params: { page }
    })
    return response
  } catch (error) {
    throw error
  }
}

export const getLoanDetail = async (loanId) => {
  try {
    const response = await api.get(`/admin/loan-detail/${loanId}`)
    return response
  } catch (error) {
    throw error
  }
}

export const approveLoan = async (loanId) => {
  try {
    const response = await api.post(`/admin/approve-loan/${loanId}`)
    return response
  } catch (error) {
    throw error
  }
}

export const rejectLoan = async (loanId, reason) => {
  try {
    const response = await api.post(`/admin/reject-loan/${loanId}`, {
      reason
    })
    return response
  } catch (error) {
    throw error
  }
}
