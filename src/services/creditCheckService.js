import api from './api'

/**
 * 3000₮ төлсөн хэрэглэгчдийг татах
 */
export const getUsersPaidCreditCheck = async (page = 1, creditLimitSet = '') => {
  try {
    const params = { page }
    if (creditLimitSet) params.creditLimitSet = creditLimitSet

    const response = await api.get('/admin/users-paid-credit-check', { params })
    return response
  } catch (error) {
    throw error
  }
}

/**
 * Хэрэглэгчийн дэлгэрэнгүй мэдээлэл (KYC detail ашиглана)
 */
export const getCreditCheckDetail = async (userId) => {
  try {
    const response = await api.get(`/admin/kyc-detail/${userId}`)
    return response
  } catch (error) {
    throw error
  }
}

/**
 * Зээлийн эрх тогтоох
 */
export const setCreditLimit = async (userId, creditLimit) => {
  try {
    const response = await api.post(`/admin/set-credit-limit/${userId}`, {
      creditLimit: Number(creditLimit)
    })
    return response
  } catch (error) {
    throw error
  }
}