import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiEye } from 'react-icons/fi'
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

  useEffect(() => {
    fetchKYC()
  }, [filter, page])

  const fetchKYC = async () => {
    setLoading(true)
    try {
      const response = await getPendingKYC(page, filter)
      if (response.success) {
        setKycList(response.data)
      }
    } catch (error) {
      toast.error('KYC жагсаалт татахад алдаа гарлаа')
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
        <h1 className="text-3xl font-bold text-gray-900">KYC Баталгаажуулалт</h1>
        <p className="text-gray-600 mt-1">Хэрэглэгчдийн баталгаажуулалтын хүсэлтүүд</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <FilterButton status="pending" label="Хүлээгдэж байна" />
        <FilterButton status="approved" label="Зөвшөөрөгдсөн" />
        <FilterButton status="rejected" label="Татгалзсан" />
      </div>

      {/* Table Card */}
      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : kycList.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">KYC хүсэлт байхгүй байна</p>
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
                    Утас / Email
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
                {kycList.map((kyc) => (
                  <tr key={kyc.user_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {kyc.first_name} {kyc.last_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{kyc.phone}</div>
                      <div className="text-sm text-gray-500">{kyc.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(kyc.submitted_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(kyc.kyc_status)}`}>
                        {getStatusText(kyc.kyc_status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link to={`/kyc/${kyc.user_id}`}>
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

export default KYCListPage
