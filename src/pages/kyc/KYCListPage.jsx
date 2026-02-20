import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiEye, FiRefreshCw } from 'react-icons/fi'
import { getPendingKYC } from '../../services/kycService'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import { formatDateTime, getStatusColor, getStatusText } from '../../utils/formatters'
import toast from 'react-hot-toast'

const KYCListPage = () => {
  const [loading, setLoading] = useState(true)
  const [kycList, setKycList] = useState([])
  const [filter, setFilter] = useState('pending')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetchKYC()
  }, [filter, page])

  const fetchKYC = async () => {
    setLoading(true)
    try {
      const response = await getPendingKYC(page, filter)
      if (response.success) {
        // Backend: response.data = { users: [...] }
        setKycList(response.data?.users || [])
        setTotalPages(response.pages || 1)
        setTotal(response.total || 0)
      }
    } catch (error) {
      toast.error('KYC жагсаалт татахад алдаа гарлаа')
    } finally {
      setLoading(false)
    }
  }

  const FilterButton = ({ status, label }) => (
    <button
      onClick={() => { setFilter(status); setPage(1) }}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        filter === status
          ? 'bg-primary-600 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">KYC Баталгаажуулалт</h1>
          <p className="text-gray-600 mt-1">Нийт: {total} хүсэлт</p>
        </div>
        <button onClick={fetchKYC} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <FiRefreshCw className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <FilterButton status="pending" label="⏳ Хүлээгдэж байна" />
        <FilterButton status="approved" label="✅ Зөвшөөрөгдсөн" />
        <FilterButton status="rejected" label="❌ Татгалзсан" />
        <FilterButton status="all" label="📋 Бүгд" />
      </div>

      {/* Table Card */}
      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : kycList.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">KYC хүсэлт байхгүй байна</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Хэрэглэгч
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Утас
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Регистр
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Илгээсэн огноо
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Төлөв
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Үйлдэл
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {kycList.map((user) => (
                    // Backend returns: user._id, user.phoneNumber, user.name, user.personalInfo, user.kycStatus, user.kycSubmittedAt
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {user.personalInfo?.lastName || ''} {user.personalInfo?.firstName || user.name || '-'}
                        </div>
                        <div className="text-xs text-gray-500">{user.email || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.phoneNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {user.personalInfo?.registerNumber || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(user.kycSubmittedAt || user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.kycStatus)}`}>
                          {getStatusText(user.kycStatus)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link to={`/kyc/${user._id}`}>
                          <Button size="sm" variant="outline">
                            <FiEye className="mr-1" />
                            Дэлгэрэнгүй
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200">
                <p className="text-sm text-gray-600">Хуудас {page} / {totalPages}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
                  >
                    Өмнөх
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
                  >
                    Дараах
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  )
}

export default KYCListPage