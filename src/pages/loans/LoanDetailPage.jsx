import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiCheck, FiX, FiArrowLeft } from 'react-icons/fi'
import { getLoanDetail, approveLoan, rejectLoan } from '../../services/loanService'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import { formatMoney, formatDateTime, getStatusColor, getStatusText } from '../../utils/formatters'
import toast from 'react-hot-toast'

const LoanDetailPage = () => {
  const { loanId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [loanData, setLoanData] = useState(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    fetchLoanDetail()
  }, [loanId])

  const fetchLoanDetail = async () => {
    setLoading(true)
    try {
      const response = await getLoanDetail(loanId)
      if (response.success) {
        setLoanData(response.data)
      } else {
        toast.error('Зээлийн мэдээлэл олдсонгүй')
        navigate('/loans')
      }
    } catch (error) {
      toast.error('Зээлийн мэдээлэл татахад алдаа гарлаа')
      navigate('/loans')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!confirm('Та энэ зээлийг зөвшөөрөх гэж байна уу?')) return

    setActionLoading(true)
    try {
      const response = await approveLoan(loanId)
      if (response.success) {
        toast.success('Зээл амжилттай зөвшөөрөгдлөө')
        navigate('/loans')
      } else {
        toast.error(response.message || 'Алдаа гарлаа')
      }
    } catch (error) {
      toast.error('Зээл зөвшөөрөхөд алдаа гарлаа')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Татгалзах шалтгаан оруулна уу')
      return
    }

    setActionLoading(true)
    try {
      const response = await rejectLoan(loanId, rejectReason)
      if (response.success) {
        toast.success('Зээл татгалзлаа')
        navigate('/loans')
      } else {
        toast.error(response.message || 'Алдаа гарлаа')
      }
    } catch (error) {
      toast.error('Зээл татгалзахад алдаа гарлаа')
    } finally {
      setActionLoading(false)
      setShowRejectModal(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!loanData) {
    return <div className="text-center py-12">Зээлийн мэдээлэл олдсонгүй</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/loans')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Зээлийн Дэлгэрэнгүй</h1>
            <p className="text-gray-600 mt-1">Зээлийн ID: {loanId}</p>
          </div>
        </div>

        {loanData.status === 'pending' && (
          <div className="flex gap-3">
            <Button
              variant="danger"
              onClick={() => setShowRejectModal(true)}
              disabled={actionLoading}
            >
              <FiX className="mr-2" />
              Татгалзах
            </Button>
            <Button
              variant="success"
              onClick={handleApprove}
              loading={actionLoading}
            >
              <FiCheck className="mr-2" />
              Зөвшөөрөх
            </Button>
          </div>
        )}
      </div>

      {/* Loan Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Зээлийн мэдээлэл">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Зээлийн дүн</p>
              <p className="text-2xl font-bold text-gray-900">{formatMoney(loanData.amount)}₮</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Хугацаа</p>
              <p className="text-lg font-medium text-gray-900">{loanData.duration} сар</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Хүү</p>
              <p className="text-lg font-medium text-gray-900">{loanData.interest_rate}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Төлөв</p>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(loanData.status)}`}>
                {getStatusText(loanData.status)}
              </span>
            </div>
          </div>
        </Card>

        <Card title="Хэрэглэгчийн мэдээлэл">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Нэр</p>
              <p className="text-lg font-medium text-gray-900">
                {loanData.first_name} {loanData.last_name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Утас</p>
              <p className="text-lg font-medium text-gray-900">{loanData.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-lg font-medium text-gray-900">{loanData.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">KYC Төлөв</p>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(loanData.kyc_status)}`}>
                {getStatusText(loanData.kyc_status)}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Additional Info */}
      <Card title="Нэмэлт мэдээлэл">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600">Хүсэлт илгээсэн</p>
            <p className="text-lg font-medium text-gray-900">{formatDateTime(loanData.created_at)}</p>
          </div>
          {loanData.approved_at && (
            <div>
              <p className="text-sm text-gray-600">Зөвшөөрөгдсөн</p>
              <p className="text-lg font-medium text-gray-900">{formatDateTime(loanData.approved_at)}</p>
            </div>
          )}
          {loanData.reason && (
            <div className="col-span-2">
              <p className="text-sm text-gray-600">Шалтгаан</p>
              <p className="text-lg font-medium text-gray-900">{loanData.reason}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Зээл Татгалзах</h3>
            <p className="text-gray-600 mb-4">Татгалзах шалтгааныг оруулна уу:</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 min-h-[120px] focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Жишээ: Орлого хангалтгүй"
            />
            <div className="flex gap-3 mt-4">
              <Button
                variant="secondary"
                onClick={() => setShowRejectModal(false)}
                className="flex-1"
              >
                Болих
              </Button>
              <Button
                variant="danger"
                onClick={handleReject}
                loading={actionLoading}
                className="flex-1"
              >
                Татгалзах
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LoanDetailPage
