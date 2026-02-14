import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiCheck, FiX, FiArrowLeft } from 'react-icons/fi'
import { getKYCDetail, approveKYC, rejectKYC } from '../../services/kycService'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import { formatDateTime, getStatusColor, getStatusText } from '../../utils/formatters'
import toast from 'react-hot-toast'

const KYCDetailPage = () => {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [kycData, setKycData] = useState(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    fetchKYCDetail()
  }, [userId])

  const fetchKYCDetail = async () => {
    setLoading(true)
    try {
      const response = await getKYCDetail(userId)
      if (response.success) {
        setKycData(response.data)
      } else {
        toast.error('KYC мэдээлэл олдсонгүй')
        navigate('/kyc')
      }
    } catch (error) {
      toast.error('KYC мэдээлэл татахад алдаа гарлаа')
      navigate('/kyc')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!confirm('Та энэ KYC-г зөвшөөрөх гэж байна уу?')) return

    setActionLoading(true)
    try {
      const response = await approveKYC(userId)
      if (response.success) {
        toast.success('KYC амжилттай зөвшөөрөгдлөө')
        navigate('/kyc')
      } else {
        toast.error(response.message || 'Алдаа гарлаа')
      }
    } catch (error) {
      toast.error('KYC зөвшөөрөхөд алдаа гарлаа')
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
      const response = await rejectKYC(userId, rejectReason)
      if (response.success) {
        toast.success('KYC татгалзлаа')
        navigate('/kyc')
      } else {
        toast.error(response.message || 'Алдаа гарлаа')
      }
    } catch (error) {
      toast.error('KYC татгалзахад алдаа гарлаа')
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

  if (!kycData) {
    return <div className="text-center py-12">KYC мэдээлэл олдсонгүй</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/kyc')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">KYC Дэлгэрэнгүй</h1>
            <p className="text-gray-600 mt-1">
              {kycData.first_name} {kycData.last_name}
            </p>
          </div>
        </div>

        {kycData.kyc_status === 'pending' && (
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

      {/* User Info */}
      <Card title="Хэрэглэгчийн мэдээлэл">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600">Утасны дугаар</p>
            <p className="text-lg font-medium text-gray-900">{kycData.phone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="text-lg font-medium text-gray-900">{kycData.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Регистр</p>
            <p className="text-lg font-medium text-gray-900">{kycData.register_number || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Төлөв</p>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(kycData.kyc_status)}`}>
              {getStatusText(kycData.kyc_status)}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-600">Илгээсэн огноо</p>
            <p className="text-lg font-medium text-gray-900">{formatDateTime(kycData.submitted_at)}</p>
          </div>
        </div>
      </Card>

      {/* Documents */}
      <Card title="Баримт бичгүүд">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Иргэний үнэмлэх (Нүүр)</p>
            {kycData.id_card_front_url ? (
              <img
                src={kycData.id_card_front_url}
                alt="ID Front"
                className="w-full h-48 object-cover rounded-lg border border-gray-200"
              />
            ) : (
              <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Зураг байхгүй</p>
              </div>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Иргэний үнэмлэх (Ар)</p>
            {kycData.id_card_back_url ? (
              <img
                src={kycData.id_card_back_url}
                alt="ID Back"
                className="w-full h-48 object-cover rounded-lg border border-gray-200"
              />
            ) : (
              <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Зураг байхгүй</p>
              </div>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Селфи зураг</p>
            {kycData.selfie_url ? (
              <img
                src={kycData.selfie_url}
                alt="Selfie"
                className="w-full h-48 object-cover rounded-lg border border-gray-200"
              />
            ) : (
              <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Зураг байхгүй</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">KYC Татгалзах</h3>
            <p className="text-gray-600 mb-4">Татгалзах шалтгааныг оруулна уу:</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 min-h-[120px] focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Жишээ: Зураг тод биш байна"
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

export default KYCDetailPage
