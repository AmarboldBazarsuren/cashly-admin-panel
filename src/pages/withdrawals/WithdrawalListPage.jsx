import { useState, useEffect } from 'react'
import { FiEye, FiCheck, FiX, FiRefreshCw } from 'react-icons/fi'
import { getPendingWithdrawals, approveWithdrawal, rejectWithdrawal } from '../../services/withdrawalService'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import { formatMoney, formatDateTime, getStatusColor, getStatusText } from '../../utils/formatters'
import toast from 'react-hot-toast'

const WithdrawalListPage = () => {
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [withdrawals, setWithdrawals] = useState([])
  const [filter, setFilter] = useState('pending')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null)
  const [showDetail, setShowDetail] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectId, setRejectId] = useState(null)

  useEffect(() => {
    fetchWithdrawals()
  }, [filter, page])

  const fetchWithdrawals = async () => {
    setLoading(true)
    try {
      // Backend supports: pending, all
      // For completed/rejected we fetch all and filter locally
      let apiStatus = 'all'
      if (filter === 'pending') apiStatus = 'pending'

      const response = await getPendingWithdrawals(page, apiStatus)
      if (response.success) {
        let list = response.data?.withdrawals || []
        if (filter === 'completed') list = list.filter(w => w.status === 'completed')
        else if (filter === 'rejected') list = list.filter(w => w.status === 'rejected')
        else if (filter === 'pending') list = list.filter(w => w.status === 'pending')
        // 'all' => no extra filter
        setWithdrawals(list)
        setTotalPages(response.pages || 1)
        setTotal(filter === 'all' ? (response.total || list.length) : list.length)
      }
    } catch (error) {
      toast.error('Татах хүсэлт татахад алдаа гарлаа')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (withdrawalId) => {
    if (!confirm('Татах хүсэлтийг зөвшөөрөх үү? Мөнгийг данс руу шилжүүлнэ.')) return
    setActionLoading(true)
    try {
      const response = await approveWithdrawal(withdrawalId)
      if (response.success) {
        toast.success('Татах хүсэлт зөвшөөрөгдлөө ✅')
        fetchWithdrawals()
        setShowDetail(false)
      } else {
        toast.error(response.message || 'Алдаа гарлаа')
      }
    } catch (error) {
      toast.error('Зөвшөөрөхөд алдаа гарлаа')
    } finally {
      setActionLoading(false)
    }
  }

  const handleRejectOpen = (id) => {
    setRejectId(id)
    setRejectReason('')
    setShowRejectModal(true)
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) { toast.error('Татгалзах шалтгаан оруулна уу'); return }
    setActionLoading(true)
    try {
      const response = await rejectWithdrawal(rejectId, rejectReason)
      if (response.success) {
        toast.success('Татах хүсэлт татгалзлаа')
        fetchWithdrawals()
        setShowRejectModal(false)
        setShowDetail(false)
      } else {
        toast.error(response.message || 'Алдаа гарлаа')
      }
    } catch (error) {
      toast.error('Татгалзахад алдаа гарлаа')
    } finally {
      setActionLoading(false)
    }
  }

  const FilterButton = ({ status, label }) => (
    <button
      onClick={() => { setFilter(status); setPage(1) }}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        filter === status ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Мөнгө авалт</h1>
          <p className="text-gray-600 mt-1">Нийт: {total} хүсэлт</p>
        </div>
        <button onClick={fetchWithdrawals} className="p-2 hover:bg-gray-100 rounded-lg">
          <FiRefreshCw className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <FilterButton status="pending" label="⏳ Хүлээгдэж байна" />
        <FilterButton status="completed" label="✅ Зөвшөөрөгдсөн" />
        <FilterButton status="rejected" label="❌ Татгалзсан" />
        <FilterButton status="all" label="📋 Бүгд" />
      </div>

      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Татах хүсэлт байхгүй байна</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Хэрэглэгч</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дүн</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Банк</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дансны дугаар</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Огноо</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Төлөв</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Үйлдэл</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {withdrawals.map((w) => (
                  <tr key={w._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{w.user?.phoneNumber || '-'}</div>
                      <div className="text-xs text-gray-500">{w.user?.name || '-'}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{formatMoney(w.amount)}₮</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{w.bankDetails?.bankName || '-'}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{w.bankDetails?.accountNumber || '-'}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateTime(w.createdAt)}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(w.status)}`}>
                        {getStatusText(w.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        {w.status === 'pending' && (
                          <>
                            <button onClick={() => handleApprove(w._id)}
                              className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200" title="Зөвшөөрөх">
                              <FiCheck className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleRejectOpen(w._id)}
                              className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200" title="Татгалзах">
                              <FiX className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button onClick={() => { setSelectedWithdrawal(w); setShowDetail(true) }}
                          className="p-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200" title="Дэлгэрэнгүй">
                          <FiEye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Detail Modal */}
      {showDetail && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Татах хүсэлт дэлгэрэнгүй</h3>
              <button onClick={() => setShowDetail(false)} className="p-1 hover:bg-gray-100 rounded"><FiX className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-xs text-gray-500">Хэрэглэгч</p><p className="font-semibold">{selectedWithdrawal.user?.phoneNumber}</p></div>
              <div><p className="text-xs text-gray-500">Дүн</p><p className="font-semibold text-lg text-green-600">{formatMoney(selectedWithdrawal.amount)}₮</p></div>
              <div><p className="text-xs text-gray-500">Банк</p><p className="font-semibold">{selectedWithdrawal.bankDetails?.bankName}</p></div>
              <div><p className="text-xs text-gray-500">Дансны дугаар</p><p className="font-semibold">{selectedWithdrawal.bankDetails?.accountNumber}</p></div>
              <div><p className="text-xs text-gray-500">Данс эзэмшигч</p><p className="font-semibold">{selectedWithdrawal.bankDetails?.accountName}</p></div>
              <div><p className="text-xs text-gray-500">Төлөв</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedWithdrawal.status)}`}>
                  {getStatusText(selectedWithdrawal.status)}
                </span>
              </div>
              {selectedWithdrawal.rejectedReason && (
                <div className="col-span-2 bg-red-50 rounded p-2">
                  <p className="text-xs text-gray-500">Татгалзсан шалтгаан</p>
                  <p className="text-sm text-red-700 font-medium">{selectedWithdrawal.rejectedReason}</p>
                </div>
              )}
            </div>
            {selectedWithdrawal.status === 'pending' && (
              <div className="flex gap-3 mt-6">
                <Button variant="danger" onClick={() => { setShowDetail(false); handleRejectOpen(selectedWithdrawal._id) }} className="flex-1">
                  <FiX className="mr-2" /> Татгалзах
                </Button>
                <Button variant="success" onClick={() => handleApprove(selectedWithdrawal._id)} loading={actionLoading} className="flex-1">
                  <FiCheck className="mr-2" /> Зөвшөөрөх
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Татах хүсэлт Татгалзах</h3>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 min-h-[100px] focus:ring-2 focus:ring-red-500"
              placeholder="Татгалзах шалтгаан..." />
            <div className="flex gap-3 mt-4">
              <Button variant="secondary" onClick={() => setShowRejectModal(false)} className="flex-1">Болих</Button>
              <Button variant="danger" onClick={handleReject} loading={actionLoading} className="flex-1">Татгалзах</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WithdrawalListPage