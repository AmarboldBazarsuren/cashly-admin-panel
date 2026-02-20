import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FiEye, FiRefreshCw } from 'react-icons/fi'
import { getPendingLoans, getActiveLoans } from '../../services/loanService'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import { formatMoney, formatDateTime, getStatusColor, getStatusText } from '../../utils/formatters'
import toast from 'react-hot-toast'

const LoanListPage = () => {
  const [searchParams] = useSearchParams()
  const initialStatus = searchParams.get('status') || 'pending'

  const [loading, setLoading] = useState(true)
  const [loanList, setLoanList] = useState([])
  const [filter, setFilter] = useState(initialStatus)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetchLoans()
  }, [filter, page])

  const fetchLoans = async () => {
    setLoading(true)
    try {
      let response
      if (filter === 'active' || filter === 'overdue') {
        response = await getActiveLoans(page)
      } else {
        response = await getPendingLoans(page, filter)
      }

      if (response.success) {
        // Backend: response.data = { loans: [...] }
        let loans = response.data?.loans || []
        // Filter overdue locally if needed
        if (filter === 'overdue') {
          loans = loans.filter(l => l.status === 'overdue')
        }
        setLoanList(loans)
        setTotalPages(response.pages || 1)
        setTotal(response.total || 0)
      }
    } catch (error) {
      toast.error('Зээлийн жагсаалт татахад алдаа гарлаа')
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
          <h1 className="text-3xl font-bold text-gray-900">Зээлийн хүсэлтүүд</h1>
          <p className="text-gray-600 mt-1">Нийт: {total} зээл</p>
        </div>
        <button onClick={fetchLoans} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <FiRefreshCw className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <FilterButton status="pending" label="⏳ Хүлээгдэж байна" />
        <FilterButton status="active" label="✅ Идэвхтэй" />
        <FilterButton status="overdue" label="⚠️ Хугацаа хэтэрсэн" />
        <FilterButton status="completed" label="🏁 Дууссан" />
        <FilterButton status="rejected" label="❌ Татгалзсан" />
        <FilterButton status="all" label="📋 Бүгд" />
      </div>

      {/* Table Card */}
      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : loanList.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Зээлийн хүсэлт байхгүй байна</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Зээлийн дугаар</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Хэрэглэгч</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дүн</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Хугацаа</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Хүү</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Огноо</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Төлөв</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Үйлдэл</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loanList.map((loan) => (
                    // Backend: loan._id, loan.loanNumber, loan.user (populated), loan.principal, loan.term, loan.interestRate, loan.status, loan.createdAt
                    <tr key={loan._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-xs font-mono text-gray-600">{loan.loanNumber}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {loan.user?.phoneNumber || '-'}
                        </div>
                        <div className="text-xs text-gray-500">{loan.user?.name || '-'}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">{formatMoney(loan.principal)}₮</div>
                        <div className="text-xs text-gray-500">Нийт: {formatMoney(loan.totalAmount)}₮</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {loan.term} хоног
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {loan.interestRate}%
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(loan.createdAt)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                          {getStatusText(loan.status)}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Link to={`/loans/${loan._id}`}>
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

export default LoanListPage