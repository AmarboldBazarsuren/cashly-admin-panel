import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FiEye } from 'react-icons/fi'
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

  useEffect(() => {
    fetchLoans()
  }, [filter, page])

  const fetchLoans = async () => {
    setLoading(true)
    try {
      let response
      if (filter === 'active') {
        response = await getActiveLoans(page)
      } else {
        response = await getPendingLoans(page, filter)
      }
      
      if (response.success) {
        setLoanList(response.data)
      }
    } catch (error) {
      toast.error('Зээлийн жагсаалт татахад алдаа гарлаа')
    } finally {
      setLoading(false)
    }
  }

  const FilterButton = ({ status, label }) => (
    <button
      onClick={() => setFilter(status)}
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Зээлийн хүсэлтүүд</h1>
        <p className="text-gray-600 mt-1">Зээлийн хүсэлт болон идэвхтэй зээлүүд</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <FilterButton status="pending" label="Хүлээгдэж байна" />
        <FilterButton status="active" label="Идэвхтэй" />
        <FilterButton status="approved" label="Зөвшөөрөгдсөн" />
        <FilterButton status="rejected" label="Татгалзсан" />
        <FilterButton status="completed" label="Дууссан" />
      </div>

      {/* Table Card */}
      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : loanList.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Зээлийн хүсэлт байхгүй байна</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Хэрэглэгч
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дүн
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Хугацаа
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Огноо
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
                {loanList.map((loan) => (
                  <tr key={loan.loan_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{loan.phone}</div>
                      <div className="text-sm text-gray-500">{loan.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{formatMoney(loan.amount)}₮</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {loan.duration} сар
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(loan.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                        {getStatusText(loan.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link to={`/loans/${loan.loan_id}`}>
                        <Button size="sm" variant="outline">
                          <FiEye className="mr-2" />
                          Дэлгэрэнгүй
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

export default LoanListPage
