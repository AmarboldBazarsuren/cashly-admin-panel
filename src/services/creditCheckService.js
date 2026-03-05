import api from './api'

export const getUsersPaidCreditCheck = async (page = 1, creditLimitSet = '') => {
  try {
    const params = { page }
    if (creditLimitSet !== '') params.creditLimitSet = creditLimitSet
    const response = await api.get('/admin/users-paid-credit-check', { params })
    return response
  } catch (error) {
    throw error
  }
}

export const getCreditCheckDetail = async (userId) => {
  try {
    const response = await api.get(`/admin/kyc-detail/${userId}`)
    return response
  } catch (error) {
    throw error
  }
}

/**
 * Зээлийн эрх + кредит оноо + гадны зээлийн тоо тогтоох
 * Backend: POST /api/admin/set-credit-limit/:userId
 * Body: { creditLimit, creditScore, externalActiveLoansCount, notes }
 */
export const setCreditLimit = async (userId, creditLimit, creditScore, externalActiveLoansCount, notes) => {
  try {
    const body = { creditLimit: Number(creditLimit) }
    if (creditScore !== undefined && creditScore !== null && !isNaN(creditScore)) {
      body.creditScore = Number(creditScore)
    }
    if (externalActiveLoansCount !== undefined && externalActiveLoansCount !== null && !isNaN(externalActiveLoansCount)) {
      body.externalActiveLoansCount = Number(externalActiveLoansCount)
    }
    if (notes) body.notes = notes

    const response = await api.post(`/admin/set-credit-limit/${userId}`, body)
    return response
  } catch (error) {
    throw error
  }
}