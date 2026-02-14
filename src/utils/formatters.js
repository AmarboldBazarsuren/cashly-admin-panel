export const formatMoney = (amount) => {
  if (!amount) return '0'
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('mn-MN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

export const formatDateTime = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleString('mn-MN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const getStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    active: 'bg-blue-100 text-blue-800',
    completed: 'bg-gray-100 text-gray-800',
    overdue: 'bg-red-100 text-red-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export const getStatusText = (status) => {
  const texts = {
    pending: 'Хүлээгдэж байна',
    approved: 'Зөвшөөрөгдсөн',
    rejected: 'Татгалзсан',
    active: 'Идэвхтэй',
    completed: 'Дууссан',
    overdue: 'Хугацаа хэтэрсэн',
    not_submitted: 'Илгээгээгүй',
  }
  return texts[status] || status
}
