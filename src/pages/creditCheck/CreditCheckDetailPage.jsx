/**
 * CreditCheckDetailPage - Зээлийн эрх тогтоох дэлгэрэнгүй хуудас
 * 3000₮ төлсөн хэрэглэгчийн БҮХ мэдээллийг харж, зээлийн эрх оруулах
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  FiArrowLeft, FiUser, FiBriefcase, FiCreditCard, FiMapPin,
  FiPhone, FiFileText, FiDollarSign, FiSave, FiAlertCircle,
  FiCheckCircle, FiInfo, FiTrendingUp
} from 'react-icons/fi'
import { getCreditCheckDetail, setCreditLimit } from '../../services/creditCheckService'
import { formatMoney, formatDateTime } from '../../utils/formatters'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button'

// ── Туслах компонентүүд ───────────────────────────────────────
const InfoRow = ({ label, value, accent }) => (
  <div className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0">
    <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">{label}</span>
    <span className={`text-sm font-semibold text-right ${accent ? 'text-blue-600' : 'text-gray-900'}`}>
      {value || '—'}
    </span>
  </div>
)

const SectionCard = ({ icon: Icon, title, children, badge }) => (
  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
    <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-gray-400" />
        <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
      </div>
      {badge}
    </div>
    <div className="p-4">{children}</div>
  </div>
)

// ── Үндсэн компонент ─────────────────────────────────────────
export default function CreditCheckDetailPage() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userData, setUserData] = useState(null)
  const [creditLimit, setCreditLimitInput] = useState('')
  const [recommendation, setRecommendation] = useState(null)

  useEffect(() => {
    load()
  }, [userId])

  const load = async () => {
    setLoading(true)
    try {
      const res = await getCreditCheckDetail(userId)
      if (res.success) {
        const user = res.data?.user || res.data
        setUserData(user)
        // Одоо байгаа эрхийг input-д харуулах
        if (user.creditLimit > 0) {
          setCreditLimitInput(user.creditLimit.toString())
        }
        // Зөвлөмж тооцоолох
        calculateRecommendation(user)
      } else {
        toast.error('Хэрэглэгчийн мэдээлэл олдсонгүй')
        navigate('/credit-check')
      }
    } catch {
      toast.error('Татахад алдаа гарлаа')
      navigate('/credit-check')
    } finally {
      setLoading(false)
    }
  }

  const calculateRecommendation = (user) => {
    const income = user.personalInfo?.employment?.monthlyIncome || 0
    const score = user.creditScore || 0

    let recommended = 0
    let reason = []

    // Сарын орлого дээр үндэслэх (2-4 сарын орлого)
    if (income >= 1500000) {
      recommended = income * 3 // 3 сарын орлого
      reason.push('Өндөр орлоготой')
    } else if (income >= 800000) {
      recommended = income * 2.5
      reason.push('Дунд орлоготой')
    } else if (income >= 500000) {
      recommended = income * 2
      reason.push('Хангалттай орлоготой')
    } else if (income > 0) {
      recommended = income * 1.5
      reason.push('Орлого бага')
    }

    // Кредит оноо
    if (score >= 700) {
      reason.push('Өндөр кредит оноо')
    } else if (score >= 500) {
      recommended = recommended * 0.9
      reason.push('Дунд кредит оноо')
    } else if (score > 0) {
      recommended = recommended * 0.7
      reason.push('Бага кредит оноо')
    }

    // Min/Max хязгаар
    recommended = Math.max(100000, Math.min(10000000, Math.round(recommended / 10000) * 10000))

    setRecommendation({
      amount: recommended,
      reason: reason.join(' • '),
      level: recommended >= 2000000 ? 'high' : recommended >= 1000000 ? 'medium' : 'low'
    })
  }

  const handleSave = async () => {
    const amount = parseInt(creditLimit)
    if (!amount || amount < 0) {
      toast.error('Зээлийн эрхийн дүн буруу байна')
      return
    }

    if (amount < 100000 && amount !== 0) {
      toast.error('Хамгийн бага зээлийн эрх 100,000₮')
      return
    }

    if (!confirm(`${formatMoney(amount)}₮ зээлийн эрх тогтоох уу?`)) return

    setSaving(true)
    try {
      const res = await setCreditLimit(userId, amount)
      if (res.success) {
        toast.success(`${formatMoney(amount)}₮ зээлийн эрх тогтоогдлоо ✅`)
        setTimeout(() => navigate('/credit-check'), 1500)
      } else {
        toast.error(res.message || 'Алдаа гарлаа')
      }
    } catch {
      toast.error('Хадгалахад алдаа гарлаа')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
    </div>
  )
  if (!userData) return null

  const pi = userData.personalInfo || {}
  const emp = pi.employment || {}
  const bank = pi.bankInfo || {}
  const addr = pi.address || {}
  const docs = pi.documents || {}
  const emergency = pi.emergencyContacts?.[0] || {}

  const income = emp.monthlyIncome || 0
  const hasAllInfo = userData.kycStatus === 'approved' && income > 0 && bank.accountNumber

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/credit-check')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <FiArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <FiDollarSign className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Зээлийн эрх тогтоох</h1>
              {userData.creditLimit > 0 && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm font-semibold">
                  ✓ Тогтоосон
                </span>
              )}
            </div>
            <p className="text-gray-500 text-sm mt-1">
              {pi.lastName} {pi.firstName || userData.name} • {userData.phoneNumber}
            </p>
          </div>
        </div>
      </div>

      {/* Warning if info incomplete */}
      {!hasAllInfo && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl px-5 py-4 flex gap-3">
          <FiAlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-orange-800 mb-1">Мэдээлэл дутуу байна</p>
            <ul className="text-sm text-orange-700 space-y-0.5">
              {userData.kycStatus !== 'approved' && <li>• KYC баталгаажаагүй</li>}
              {!income && <li>• Орлогын мэдээлэл байхгүй</li>}
              {!bank.accountNumber && <li>• Банкны мэдээлэл байхгүй</li>}
            </ul>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT: Мэдээлэл */}
        <div className="xl:col-span-2 space-y-5">

          {/* User summary banner */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl font-bold">
                  {userData.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{pi.lastName} {pi.firstName || userData.name}</h2>
                  <p className="text-blue-200 text-sm">{userData.phoneNumber}</p>
                  <p className="text-blue-200 text-sm">Регистр: {pi.registerNumber || '—'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-blue-200 text-xs mb-1">Кредит оноо</p>
                <p className="text-3xl font-bold">{userData.creditScore || 0}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-blue-500">
              <div>
                <p className="text-blue-200 text-xs">KYC</p>
                <p className="font-semibold text-sm">
                  {userData.kycStatus === 'approved' ? '✓ Баталгаажсан' : 'Хүлээгдэж байна'}
                </p>
              </div>
              <div>
                <p className="text-blue-200 text-xs">Төлбөр төлсөн</p>
                <p className="font-semibold text-sm">{formatDateTime(userData.creditCheckPaidAt)}</p>
              </div>
              <div>
                <p className="text-blue-200 text-xs">Одоогийн эрх</p>
                <p className="font-semibold text-sm">
                  {userData.creditLimit > 0 ? `${formatMoney(userData.creditLimit)}₮` : 'Тогтоогоогүй'}
                </p>
              </div>
            </div>
          </div>

          {/* Recommendation card */}
          {recommendation && (
            <div className={`rounded-xl p-5 border shadow-sm ${
              recommendation.level === 'high' ? 'bg-green-50 border-green-200'
              : recommendation.level === 'medium' ? 'bg-blue-50 border-blue-200'
              : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  recommendation.level === 'high' ? 'bg-green-100'
                  : recommendation.level === 'medium' ? 'bg-blue-100'
                  : 'bg-yellow-100'
                }`}>
                  <FiTrendingUp className={`w-5 h-5 ${
                    recommendation.level === 'high' ? 'text-green-600'
                    : recommendation.level === 'medium' ? 'text-blue-600'
                    : 'text-yellow-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-semibold mb-1 ${
                    recommendation.level === 'high' ? 'text-green-900'
                    : recommendation.level === 'medium' ? 'text-blue-900'
                    : 'text-yellow-900'
                  }`}>
                    💡 Зөвлөмж: {formatMoney(recommendation.amount)}₮
                  </p>
                  <p className={`text-sm ${
                    recommendation.level === 'high' ? 'text-green-700'
                    : recommendation.level === 'medium' ? 'text-blue-700'
                    : 'text-yellow-700'
                  }`}>
                    {recommendation.reason}
                  </p>
                  <button
                    onClick={() => setCreditLimitInput(recommendation.amount.toString())}
                    className={`mt-2 text-xs font-semibold underline ${
                      recommendation.level === 'high' ? 'text-green-700 hover:text-green-800'
                      : recommendation.level === 'medium' ? 'text-blue-700 hover:text-blue-800'
                      : 'text-yellow-700 hover:text-yellow-800'
                    }`}
                  >
                    → Энэ дүнг ашиглах
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Employment & Income */}
          <SectionCard 
            icon={FiBriefcase} 
            title="Ажил болон орлого"
            badge={income > 0 ? (
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                ✓ Бүрэн
              </span>
            ) : null}
          >
            <InfoRow label="Ажлын байдал" value={emp.status} />
            {emp.companyName && <InfoRow label="Байгууллага" value={emp.companyName} />}
            {emp.position && <InfoRow label="Албан тушаал" value={emp.position} />}
            <InfoRow 
              label="Сарын орлого" 
              value={income > 0 ? `${formatMoney(income)}₮` : 'Байхгүй'} 
              accent={income > 0}
            />
            {income > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-500">2-4 сарын орлого (зөвлөмж)</span>
                  <span className="font-semibold text-gray-700">
                    {formatMoney(income * 2)}₮ - {formatMoney(income * 4)}₮
                  </span>
                </div>
              </div>
            )}
          </SectionCard>

          {/* Bank Info */}
          <SectionCard 
            icon={FiCreditCard} 
            title="Банкны мэдээлэл"
            badge={bank.accountNumber ? (
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                ✓ Бүрэн
              </span>
            ) : null}
          >
            <InfoRow label="Банк" value={bank.bankName} />
            <InfoRow label="Дансны дугаар" value={bank.accountNumber} accent />
            <InfoRow label="Данс эзэмшигч" value={bank.accountName} />
          </SectionCard>

          {/* Address */}
          <SectionCard icon={FiMapPin} title="Хаяг мэдээлэл">
            <InfoRow label="Хот/Аймаг" value={addr.city} />
            <InfoRow label="Дүүрэг/Сум" value={addr.district} />
            <InfoRow label="Хороо" value={addr.khoroo} />
            {addr.fullAddress && (
              <div className="pt-2.5 border-t border-gray-100 mt-2">
                <p className="text-xs text-gray-400 mb-1">Дэлгэрэнгүй хаяг</p>
                <p className="text-sm text-gray-700 leading-relaxed">{addr.fullAddress}</p>
              </div>
            )}
          </SectionCard>

          {/* Emergency Contact */}
          {emergency.name && (
            <SectionCard icon={FiPhone} title="Яаралтай холбоо">
              <InfoRow label="Нэр" value={emergency.name} />
              <InfoRow label="Хамаарал" value={emergency.relationship} />
              <InfoRow label="Утас" value={emergency.phoneNumber} accent />
            </SectionCard>
          )}

          {/* Documents */}
          <SectionCard icon={FiFileText} title="Баримт бичгүүд">
            <div className="grid grid-cols-3 gap-4">
              {[
                { key: 'idCardFront', label: 'Үнэмлэх (Нүүр)' },
                { key: 'idCardBack', label: 'Үнэмлэх (Ар)' },
                { key: 'selfie', label: 'Селфи' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <p className="text-xs text-gray-500 mb-2">{label}</p>
                  {docs[key]?.url ? (
                    <a href={docs[key].url} target="_blank" rel="noopener noreferrer">
                      <img
                        src={docs[key].url}
                        alt={label}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200 hover:opacity-90 transition-opacity cursor-pointer"
                      />
                    </a>
                  ) : (
                    <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                      <p className="text-gray-400 text-xs">Байхгүй</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* RIGHT: Зээлийн эрх тогтоох form */}
        <div className="space-y-4">
          {/* Current status */}
          {userData.creditLimit > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <FiCheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-green-900">Зээлийн эрх тогтоосон</p>
                  <p className="text-xs text-green-700">
                    {formatDateTime(userData.creditLimitSetAt)}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">Одоогийн зээлийн эрх</p>
                <p className="text-3xl font-bold text-green-600">
                  {formatMoney(userData.creditLimit)}₮
                </p>
              </div>
            </div>
          )}

          {/* Set credit limit form */}
          <div className="bg-white border-2 border-blue-200 rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-4">
              <h3 className="font-bold text-white flex items-center gap-2">
                <FiDollarSign className="w-5 h-5" />
                Зээлийн эрх тогтоох
              </h3>
            </div>
            <div className="p-5 space-y-4">
              {/* Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Зээлийн эрхийн дүн (₮) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={creditLimit}
                  onChange={(e) => setCreditLimitInput(e.target.value)}
                  placeholder="Жишээ: 1000000"
                  min="0"
                  step="10000"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold transition-all"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Хамгийн бага: 100,000₮ эсвэл 0₮ (эрх олгохгүй)
                </p>
              </div>

              {/* Preview */}
              {creditLimit && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-xs text-blue-600 mb-1">Тогтоох дүн:</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {formatMoney(parseInt(creditLimit) || 0)}₮
                  </p>
                </div>
              )}

              {/* Quick buttons */}
              <div>
                <p className="text-xs font-medium text-gray-600 mb-2">Түргэн сонголт:</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: '500K', value: 500000 },
                    { label: '1M', value: 1000000 },
                    { label: '2M', value: 2000000 },
                    { label: '5M', value: 5000000 },
                  ].map(({ label, value }) => (
                    <button
                      key={value}
                      onClick={() => setCreditLimitInput(value.toString())}
                      className="px-3 py-2 bg-gray-100 hover:bg-blue-100 hover:text-blue-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Save button */}
              <Button
                variant="success"
                onClick={handleSave}
                loading={saving}
                className="w-full py-3 text-base"
                disabled={!creditLimit || parseInt(creditLimit) < 0}
              >
                <FiSave className="mr-2 w-5 h-5" />
                Зээлийн эрх хадгалах
              </Button>

              {/* Info */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex gap-2 text-xs text-gray-600">
                  <FiInfo className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <p>
                    Зээлийн эрх тогтоосны дараа хэрэглэгч зээл авч эхэлнэ. 
                    Дараа нь эрхийг өөрчлөх боломжтой.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats summary */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50">
              <h3 className="font-semibold text-gray-800 text-sm">Хураангуй мэдээлэл</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Кредит оноо</span>
                <span className="font-semibold">{userData.creditScore || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Сарын орлого</span>
                <span className="font-semibold">
                  {income > 0 ? `${formatMoney(income)}₮` : '—'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">KYC төлөв</span>
                <span className={`font-semibold ${
                  userData.kycStatus === 'approved' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {userData.kycStatus === 'approved' ? '✓ Баталгаажсан' : 'Хүлээгдэж байна'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Банкны данс</span>
                <span className={`font-semibold ${bank.accountNumber ? 'text-green-600' : 'text-red-600'}`}>
                  {bank.accountNumber ? '✓ Бүрэн' : '✗ Байхгүй'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}