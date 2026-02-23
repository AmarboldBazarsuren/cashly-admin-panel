import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiEye, FiRefreshCw, FiDollarSign, FiCheckCircle, FiClock } from 'react-icons/fi'
import { getUsersPaidCreditCheck } from '../../services/creditCheckService'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import { formatMoney, formatDateTime } from '../../utils/formatters'
import toast from 'react-hot-toast'

const CreditCheckListPage = () => {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [filter, setFilter] = useState('false') // 'false' = эрх тогтоогоогүй
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetchUsers()
  }, [filter, page])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await getUsersPaidCreditCheck(page, filter)
      if (response.success) {
        // Backend: response.data = { users: [...] }
        setUsers(response.data?.users || [])
        setTotalPages(response.pages || 1)
        setTotal(response.total || 0)
      }
    } catch (error) {
      toast.error('Хэрэглэгчид татахад алдаа гарлаа')
    } finally {
      setLoading(false)
    }
  }

  const FilterButton = ({ value, label, icon: Icon }) => (
    <button
      onClick={() => { setFilter(value); setPage(1) }}
      className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
        filter === value
          ? 'bg-primary-600 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">💳 Зээлийн эрх тогтоох</h1>
          <p className="text-gray-600 mt-1">
            3,000₮ зээлийн эрх шалгах төлбөр төлсөн хэрэглэгчид • Нийт: {total}
          </p>
        </div>
        <button 
          onClick={fetchUsers} 
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Шинэчлэх"
        >
          <FiRefreshCw className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4">
        <div className="flex items-start gap-3">
          <FiDollarSign className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-900 mb-1">
              Зээлийн эрх тогтоох заавар
            </p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Хэрэглэгчийн KYC, ажил, орлого, банкны мэдээллийг анхааралтай шалгана уу</li>
              <li>• Орлого, кредит оноо, өмнөх зээлийн түүхийг үндэслэн зээлийн эрхийг тогтооно</li>
              <li>• Зээлийн эрх тогтоосны дараа хэрэглэгч зээл авч эхэлнэ</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <FilterButton value="false" label="Хүлээгдэж байна" icon={FiClock} />
        <FilterButton value="true" label="Эрх тогтоосон" icon={FiCheckCircle} />
        <FilterButton value="" label="Бүгд" icon={FiDollarSign} />
      </div>

      {/* Table Card */}
      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <FiDollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {filter === 'false' 
                ? 'Зээлийн эрх тогтоох хэрэглэгч байхгүй байна'
                : 'Хэрэглэгч олдсонгүй'
              }
            </p>
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
                      KYC Төлөв
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Төлбөр төлсөн огноо
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Зээлийн эрх
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Тогтоосон огноо
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Үйлдэл
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {user.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.name || '—'}</div>
                            <div className="text-xs text-gray-500">{user.phoneNumber}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.kycStatus === 'approved' ? (
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold flex items-center gap-1 w-fit">
                            <FiCheckCircle className="w-3 h-3" />
                            Баталгаажсан
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                            {user.kycStatus || 'Хүлээгдэж байна'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDateTime(user.creditCheckPaidAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.creditLimit > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-green-600">
                              {formatMoney(user.creditLimit)}₮
                            </span>
                          </div>
                        ) : (
                          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                            Тогтоогоогүй
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.creditLimitSetAt ? formatDateTime(user.creditLimitSetAt) : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link to={`/credit-check/${user._id}`}>
                          <Button size="sm" variant={user.creditLimit > 0 ? 'outline' : 'primary'}>
                            <FiEye className="mr-1.5 w-4 h-4" />
                            {user.creditLimit > 0 ? 'Харах' : 'Шалгах'}
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
              <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
                <p className="text-sm text-gray-600">
                  Хуудас {page} / {totalPages} • Нийт {total} хэрэглэгч
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors text-sm font-medium"
                  >
                    ← Өмнөх
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors text-sm font-medium"
                  >
                    Дараах →
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

export default CreditCheckListPage