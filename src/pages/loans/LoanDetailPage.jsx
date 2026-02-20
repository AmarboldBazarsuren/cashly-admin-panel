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
  const [loan, setLoan] = useState(null)
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
        // Backend: response.data = { loan: { ...loanFields, user: { populated } } }
        setLoan(response.data?.loan || response.data)
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
    if (!confirm('Та энэ зээлийг зөвшөөрөх гэж байна уу? Хэтэвчинд мөнгө орно.')) return
    setActionLoading(true)
    try {
      const response = await approveLoan(loanId)
      if (response.success) {
        toast.success('Зээл амжилттай зөвшөөрөгдлөө ✅')
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

  if (!loan) {
    return <div className="text-center py-12 text-gray-500">Зээлийн мэдээлэл олдсонгүй</div>
  }

  const user = loan.user || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/loans')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Зээлийн Дэлгэрэнгүй</h1>
            <p className="text-gray-600 mt-1 font-mono text-sm">{loan.loanNumber}</p>
          </div>
        </div>

        {loan.status === 'pending' && (
          <div className="flex gap-3">
            <Button variant="danger" onClick={() => setShowRejectModal(true)} disabled={actionLoading}>
              <FiX className="mr-2" /> Татгалзах
            </Button>
            <Button variant="success" onClick={handleApprove} loading={actionLoading}>
              <FiCheck className="mr-2" /> Зөвшөөрөх
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Loan Info */}
        <Card title="Зээлийн мэдээлэл">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">Зээлийн дүн</p>
                <p className="text-2xl font-bold text-gray-900">{formatMoney(loan.principal)}₮</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">Нийт төлөх</p>
                <p className="text-2xl font-bold text-orange-600">{formatMoney(loan.totalAmount)}₮</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">Хугацаа</p>
                <p className="text-lg font-semibold text-gray-900">{loan.term} хоног</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">Хүүний хувь</p>
                <p className="text-lg font-semibold text-gray-900">{loan.interestRate}% ({formatMoney(loan.interestAmount)}₮)</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">Зориулалт</p>
                <p className="text-lg font-semibold text-gray-900">{loan.purpose || 'Хувийн'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">Төлөв</p>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(loan.status)}`}>
                  {getStatusText(loan.status)}
                </span>
              </div>
            </div>

            {loan.status === 'active' || loan.status === 'extended' || loan.status === 'overdue' ? (
              <div className="bg-gray-50 rounded-lg p-3 mt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Төлсөн дүн</p>
                    <p className="font-semibold text-green-600">{formatMoney(loan.paidAmount)}₮</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Үлдэгдэл</p>
                    <p className="font-semibold text-red-600">{formatMoney(loan.remainingAmount)}₮</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Дуусах огноо</p>
                    <p className="font-semibold text-gray-900">{formatDateTime(loan.dueDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Сунгасан тоо</p>
                    <p className="font-semibold text-gray-900">{loan.extensionCount || 0} удаа</p>
                  </div>
                </div>
              </div>
            ) : null}

            {loan.status === 'rejected' && loan.rejectedReason && (
              <div className="bg-red-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Татгалзсан шалтгаан</p>
                <p className="text-red-700 font-medium">{loan.rejectedReason}</p>
              </div>
            )}
          </div>
        </Card>

        {/* User Info */}
        <Card title="Хэрэглэгчийн мэдээлэл">
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Нэр</p>
              <p className="text-lg font-semibold text-gray-900">
                {user.personalInfo?.lastName} {user.personalInfo?.firstName || user.name}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Утас</p>
              <p className="text-lg font-semibold text-gray-900">{user.phoneNumber}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">KYC Төлөв</p>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(user.kycStatus)}`}>
                {getStatusText(user.kycStatus)}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Зээлийн эрх</p>
              <p className="text-lg font-semibold text-gray-900">{formatMoney(user.creditLimit || 0)}₮</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Кредит оноо</p>
              <p className="text-lg font-semibold text-gray-900">{user.creditScore || 0} оноо</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Банк / Данс</p>
              <p className="text-sm text-gray-900">
                {user.personalInfo?.bankInfo?.bankName || '-'} / {user.personalInfo?.bankInfo?.accountNumber || '-'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Timestamps */}
      <Card title="Огноо мэдээлэл">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase mb-1">Хүсэлт илгээсэн</p>
            <p className="font-medium text-gray-900 text-sm">{formatDateTime(loan.createdAt)}</p>
          </div>
          {loan.approvedAt && (
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Зөвшөөрөгдсөн</p>
              <p className="font-medium text-gray-900 text-sm">{formatDateTime(loan.approvedAt)}</p>
            </div>
          )}
          {loan.disbursedAt && (
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Мөнгө олгосон</p>
              <p className="font-medium text-gray-900 text-sm">{formatDateTime(loan.disbursedAt)}</p>
            </div>
          )}
          {loan.dueDate && (
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Дуусах огноо</p>
              <p className="font-medium text-gray-900 text-sm">{formatDateTime(loan.dueDate)}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Зээл Татгалзах</h3>
            <p className="text-gray-600 mb-4">Татгалзах шалтгааныг оруулна уу:</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 min-h-[120px] focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Жишээ: Орлого хангалтгүй, KYC баталгаажаагүй"
            />
            <div className="flex gap-3 mt-4">
              <Button variant="secondary" onClick={() => setShowRejectModal(false)} className="flex-1">
                Болих
              </Button>
              <Button variant="danger" onClick={handleReject} loading={actionLoading} className="flex-1">
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