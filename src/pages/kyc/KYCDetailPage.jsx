import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiCheck, FiX, FiArrowLeft, FiUser } from 'react-icons/fi'
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
  const [userData, setUserData] = useState(null)
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
        // Backend: response.data = { user: { _id, phoneNumber, name, personalInfo, kycStatus, ... } }
        setUserData(response.data?.user || response.data)
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
        toast.success('KYC амжилттай зөвшөөрөгдлөө ✅')
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

  if (!userData) {
    return <div className="text-center py-12 text-gray-500">KYC мэдээлэл олдсонгүй</div>
  }

  // MongoDB field names
  const pi = userData.personalInfo || {}
  const docs = pi.documents || {}
  const employment = pi.employment || {}
  const address = pi.address || {}
  const bankInfo = pi.bankInfo || {}
  const emergency = pi.emergencyContacts?.[0] || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/kyc')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">KYC Дэлгэрэнгүй</h1>
            <p className="text-gray-600 mt-1">{pi.lastName} {pi.firstName || userData.name}</p>
          </div>
        </div>

        {userData.kycStatus === 'pending' && (
          <div className="flex gap-3">
            <Button variant="danger" onClick={() => setShowRejectModal(true)} disabled={actionLoading}>
              <FiX className="mr-2" /> Татгалзах
            </Button>
            <Button variant="success" onClick={handleApprove} loading={actionLoading}>
              <FiCheck className="mr-2" /> Зөвшөөрөх
            </Button>
          </div>
        )}

        {userData.kycStatus === 'approved' && (
          <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium">✅ Зөвшөөрөгдсөн</span>
        )}
        {userData.kycStatus === 'rejected' && (
          <span className="px-4 py-2 bg-red-100 text-red-800 rounded-lg font-medium">❌ Татгалзсан</span>
        )}
      </div>

      {/* User Info */}
      <Card title="Үндсэн мэдээлэл">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase mb-1">Утасны дугаар</p>
            <p className="font-semibold text-gray-900">{userData.phoneNumber}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase mb-1">Нэр</p>
            <p className="font-semibold text-gray-900">{pi.lastName} {pi.firstName || userData.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase mb-1">Регистр</p>
            <p className="font-semibold text-gray-900">{pi.registerNumber || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase mb-1">Хүйс</p>
            <p className="font-semibold text-gray-900">{pi.gender || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase mb-1">Боловсрол</p>
            <p className="font-semibold text-gray-900">{pi.education || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase mb-1">KYC Төлөв</p>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(userData.kycStatus)}`}>
              {getStatusText(userData.kycStatus)}
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase mb-1">Илгээсэн огноо</p>
            <p className="font-semibold text-gray-900">{formatDateTime(userData.kycSubmittedAt) || '-'}</p>
          </div>
          {userData.kycStatus === 'rejected' && userData.kycRejectedReason && (
            <div className="col-span-3 bg-red-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 uppercase mb-1">Татгалзсан шалтгаан</p>
              <p className="font-semibold text-red-700">{userData.kycRejectedReason}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Employment Info */}
      <Card title="Ажлын мэдээлэл">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase mb-1">Ажлын статус</p>
            <p className="font-semibold text-gray-900">{employment.status || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase mb-1">Байгууллага</p>
            <p className="font-semibold text-gray-900">{employment.companyName || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase mb-1">Албан тушаал</p>
            <p className="font-semibold text-gray-900">{employment.position || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase mb-1">Сарын орлого</p>
            <p className="font-semibold text-gray-900">
              {employment.monthlyIncome ? `${employment.monthlyIncome.toLocaleString()}₮` : '-'}
            </p>
          </div>
        </div>
      </Card>

      {/* Bank & Address */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Банкны мэдээлэл">
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Банк</p>
              <p className="font-semibold text-gray-900">{bankInfo.bankName || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Дансны дугаар</p>
              <p className="font-semibold text-gray-900">{bankInfo.accountNumber || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Данс эзэмшигч</p>
              <p className="font-semibold text-gray-900">{bankInfo.accountName || '-'}</p>
            </div>
          </div>
        </Card>

        <Card title="Хаяг">
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Хот/Аймаг</p>
              <p className="font-semibold text-gray-900">{address.city || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Дүүрэг/Сум</p>
              <p className="font-semibold text-gray-900">{address.district || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Дэлгэрэнгүй хаяг</p>
              <p className="font-semibold text-gray-900">{address.fullAddress || '-'}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Documents */}
      <Card title="Баримт бичгүүд">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { key: 'idCardFront', label: 'Иргэний үнэмлэх (Нүүр)' },
            { key: 'idCardBack', label: 'Иргэний үнэмлэх (Ар)' },
            { key: 'selfie', label: 'Селфи зураг' },
          ].map(({ key, label }) => (
            <div key={key}>
              <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>
              {docs[key]?.url ? (
                <a href={docs[key].url} target="_blank" rel="noopener noreferrer">
                  <img
                    src={docs[key].url}
                    alt={label}
                    className="w-full h-48 object-cover rounded-lg border border-gray-200 hover:opacity-90 transition-opacity cursor-pointer"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                  <div className="hidden w-full h-48 bg-gray-100 rounded-lg items-center justify-center">
                    <p className="text-gray-500 text-sm">Зураг нээх боломжгүй</p>
                  </div>
                </a>
              ) : (
                <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <FiUser className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Зураг байхгүй</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">KYC Татгалзах</h3>
            <p className="text-gray-600 mb-4">Татгалзах шалтгааныг оруулна уу:</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 min-h-[120px] focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Жишээ: Зураг тод биш байна, иргэний үнэмлэх нь буруу байна"
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

export default KYCDetailPage