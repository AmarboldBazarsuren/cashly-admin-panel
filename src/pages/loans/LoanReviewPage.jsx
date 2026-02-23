/**
 * LoanReviewPage.jsx — Зээлийн хүсэлт ШАЛГАХ хуудас
 * БАЙРШИЛ: src/pages/loans/LoanReviewPage.jsx
 *
 * Зөвхөн status='pending' зээлүүдэд хэрэглэгдэнэ.
 * Зорилго: Хэрэглэгчийн мэдээллийг шалгаж, зөвшөөрөх эсвэл татгалзах.
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  FiArrowLeft, FiCheck, FiX, FiXCircle, FiUser,
  FiShield, FiBriefcase, FiCreditCard, FiMapPin,
  FiPhone, FiInfo, FiAlertTriangle,
} from 'react-icons/fi'
import { getLoanDetail, approveLoan, rejectLoan } from '../../services/loanService'
import { formatMoney, formatDateTime, getStatusColor, getStatusText } from '../../utils/formatters'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button'

// ── Туслах компонентүүд ───────────────────────────────────────

const InfoRow = ({ label, value, accent }) => (
  <div className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0">
    <span className="text-xs text-gray-500 uppercase tracking-wide font-medium flex-shrink-0">{label}</span>
    <span className={`text-sm font-semibold text-right ml-4 ${accent ? 'text-blue-600' : 'text-gray-900'}`}>
      {value || '—'}
    </span>
  </div>
)

const SectionCard = ({ icon: Icon, title, children }) => (
  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
    <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
      <Icon className="w-4 h-4 text-gray-400" />
      <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
    </div>
    <div className="p-4 space-y-0.5">{children}</div>
  </div>
)

const RiskBadge = ({ level }) => {
  const c = {
    low:    { label: 'Бага эрсдэл',  cls: 'bg-green-100 text-green-800',   dot: 'bg-green-500' },
    medium: { label: 'Дунд эрсдэл',  cls: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-500' },
    high:   { label: 'Өндөр эрсдэл', cls: 'bg-red-100 text-red-800',       dot: 'bg-red-500' },
  }[level] || { label: '—', cls: 'bg-gray-100 text-gray-800', dot: 'bg-gray-400' }
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${c.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  )
}

const MiniBar = ({ value, max, color }) => {
  const pct = Math.min(100, max > 0 ? Math.round((value / max) * 100) : 0)
  return (
    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1.5">
      <div className={`${color} h-1.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
    </div>
  )
}

const calcRisk = (loan, user) => {
  let score = 0
  const cs = user?.creditScore || 0
  const cl = user?.creditLimit || 0
  const income = user?.personalInfo?.employment?.monthlyIncome || 0
  if (cs >= 700) score += 3; else if (cs >= 500) score += 1; else score -= 2
  if (cl > 0 && loan.principal <= cl * 0.6) score += 2
  else if (loan.principal <= cl) score += 1
  else score -= 2
  if (income > 0 && loan.principal <= income * 2) score += 2
  else if (income > 0 && loan.principal <= income * 4) score += 1
  else score -= 1
  if (user?.kycStatus === 'approved') score += 2
  if (score >= 5) return 'low'
  if (score >= 2) return 'medium'
  return 'high'
}

// ── Үндсэн компонент ─────────────────────────────────────────
export default function LoanReviewPage() {
  const { loanId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [loan, setLoan] = useState(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => { load() }, [loanId])

  const load = async () => {
    setLoading(true)
    try {
      const res = await getLoanDetail(loanId)
      if (res.success) {
        const data = res.data?.loan || res.data
        // pending бус бол detail page руу redirect
        if (data.status !== 'pending') {
          navigate(`/loans/${loanId}`, { replace: true })
          return
        }
        setLoan(data)
      } else {
        toast.error('Зээлийн хүсэлт олдсонгүй')
        navigate('/loans')
      }
    } catch {
      toast.error('Татахад алдаа гарлаа')
      navigate('/loans')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!confirm(`${formatMoney(loan.principal)}₮ зээлийг зөвшөөрөх үү?\nХэрэглэгчийн хэтэвчинд мөнгө орно.`)) return
    setActionLoading(true)
    try {
      const res = await approveLoan(loanId)
      if (res.success) { toast.success('Зээл зөвшөөрөгдлөө ✅'); navigate('/loans') }
      else toast.error(res.message || 'Алдаа гарлаа')
    } catch { toast.error('Зөвшөөрөхөд алдаа гарлаа') }
    finally { setActionLoading(false) }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) { toast.error('Шалтгаан оруулна уу'); return }
    setActionLoading(true)
    try {
      const res = await rejectLoan(loanId, rejectReason)
      if (res.success) { toast.success('Зээл татгалзлаа'); navigate('/loans') }
      else toast.error(res.message || 'Алдаа гарлаа')
    } catch { toast.error('Татгалзахад алдаа гарлаа') }
    finally { setActionLoading(false); setShowRejectModal(false) }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
    </div>
  )
  if (!loan) return null

  const user = loan.user || {}
  const pi = user.personalInfo || {}
  const emp = pi.employment || {}
  const bank = pi.bankInfo || {}
  const addr = pi.address || {}
  const emergency = pi.emergencyContacts?.[0] || {}
  const risk = calcRisk(loan, user)
  const income = emp.monthlyIncome || 0
  const dti = income > 0 ? Math.round((loan.totalAmount / income) * 100) : null

  const checks = [
    { ok: user.kycStatus === 'approved',             label: 'KYC баталгаажсан' },
    { ok: loan.principal <= (user.creditLimit || 0), label: 'Зээлийн эрхэд багтсан' },
    { ok: income > 0,                                label: 'Орлогын мэдээлэл бүрэн' },
    { ok: !dti || dti <= 300,                        label: 'Орлогын харьцаа (DTI ≤ 300%)' },
    { ok: (user.creditScore || 0) >= 500,            label: 'Кредит оноо хангалттай' },
    { ok: !!bank.accountNumber,                      label: 'Банкны мэдээлэл бүрэн' },
  ]
  const passedCount = checks.filter(c => c.ok).length

  return (
    <div className="space-y-6 pb-12">

      {/* HEADER */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/loans')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <FiArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">Зээлийн хүсэлт шалгах</h1>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-semibold">⏳ Хүлээгдэж байна</span>
              <RiskBadge level={risk} />
            </div>
            <p className="text-gray-400 text-xs mt-1 font-mono">{loan.loanNumber}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="danger" onClick={() => setShowRejectModal(true)} disabled={actionLoading}>
            <FiX className="mr-1.5 w-4 h-4" /> Татгалзах
          </Button>
          <Button variant="success" onClick={handleApprove} loading={actionLoading}>
            <FiCheck className="mr-1.5 w-4 h-4" /> Зөвшөөрөх
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* LEFT col */}
        <div className="xl:col-span-2 space-y-5">

          {/* Loan banner */}
          <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl p-6 text-white shadow-lg">
            <p className="text-blue-200 text-xs uppercase tracking-widest mb-4 font-medium">Зээлийн мэдээлэл</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              <div>
                <p className="text-blue-300 text-xs mb-1">Зээлийн дүн</p>
                <p className="text-3xl font-bold">{formatMoney(loan.principal)}₮</p>
              </div>
              <div>
                <p className="text-blue-300 text-xs mb-1">Нийт төлөх</p>
                <p className="text-2xl font-bold text-yellow-300">{formatMoney(loan.totalAmount)}₮</p>
              </div>
              <div>
                <p className="text-blue-300 text-xs mb-1">Хугацаа</p>
                <p className="text-2xl font-bold">{loan.term} <span className="text-base font-normal text-blue-200">хоног</span></p>
              </div>
              <div>
                <p className="text-blue-300 text-xs mb-1">Хүүний хувь</p>
                <p className="text-2xl font-bold">{loan.interestRate}<span className="text-base font-normal text-blue-200">%</span></p>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-blue-600 flex flex-wrap gap-x-6 gap-y-1 text-xs text-blue-200">
              <span>Хүүний дүн: <strong className="text-white">{formatMoney(loan.interestAmount)}₮</strong></span>
              <span>Зориулалт: <strong className="text-white">{loan.purpose || 'Хувийн'}</strong></span>
              <span>Илгээсэн: <strong className="text-white">{formatDateTime(loan.createdAt)}</strong></span>
            </div>
          </div>

          {/* Checklist */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <FiShield className="w-4 h-4 text-gray-500" />
                <h3 className="font-semibold text-gray-800">Шалгалтын жагсаалт</h3>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                passedCount === checks.length ? 'bg-green-100 text-green-700'
                : passedCount >= 4 ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
              }`}>
                {passedCount}/{checks.length} давсан
              </span>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {checks.map(({ ok, label }) => (
                <div key={label} className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${
                  ok ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  {ok
                    ? <FiCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
                    : <FiAlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  }
                  <span className={`text-sm font-medium ${ok ? 'text-green-800' : 'text-red-700'}`}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Risk analysis */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
              <FiShield className="w-4 h-4 text-gray-400" />
              <h3 className="font-semibold text-gray-800">Эрсдэлийн шинжилгээ</h3>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase font-medium mb-3">Зээлийн эрхийн ашиглалт</p>
                <p className="text-2xl font-bold text-gray-900">{formatMoney(loan.principal)}₮</p>
                <MiniBar
                  value={loan.principal}
                  max={user.creditLimit || loan.principal}
                  color={loan.principal > (user.creditLimit || 0) ? 'bg-red-500' : 'bg-blue-500'}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1.5">
                  <span>Эрх: {formatMoney(user.creditLimit || 0)}₮</span>
                  <span className="font-semibold">
                    {user.creditLimit > 0 ? `${Math.round((loan.principal / user.creditLimit) * 100)}%` : '—'}
                  </span>
                </div>
                {loan.principal > (user.creditLimit || 0) && (
                  <p className="text-xs text-red-600 font-semibold mt-2">⚠ Эрхээс хэтэрсэн</p>
                )}
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase font-medium mb-3">Орлого / Зээл (DTI)</p>
                {income > 0 ? (
                  <>
                    <p className="text-2xl font-bold" style={{
                      color: (dti || 0) > 400 ? '#dc2626' : (dti || 0) > 200 ? '#d97706' : '#16a34a'
                    }}>{dti}%</p>
                    <MiniBar
                      value={loan.totalAmount}
                      max={income * 6}
                      color={(dti || 0) > 400 ? 'bg-red-500' : (dti || 0) > 200 ? 'bg-yellow-500' : 'bg-green-500'}
                    />
                    <p className="text-xs text-gray-500 mt-1.5">
                      Сарын орлого: <span className="font-semibold text-gray-800">{formatMoney(income)}₮</span>
                    </p>
                    <p className={`text-xs font-semibold mt-1 ${
                      (dti || 0) <= 200 ? 'text-green-600' : (dti || 0) <= 400 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {(dti || 0) <= 200 ? '✓ Хэвийн' : (dti || 0) <= 400 ? '△ Анхаарах' : '✗ Өндөр'}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-gray-400 mt-2">Орлогын мэдээлэл байхгүй</p>
                )}
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase font-medium mb-3">Кредит оноо</p>
                <p className={`text-2xl font-bold ${
                  (user.creditScore || 0) >= 700 ? 'text-green-600'
                    : (user.creditScore || 0) >= 500 ? 'text-yellow-600'
                    : 'text-red-600'
                }`}>{user.creditScore || 0}</p>
                <div className="flex gap-1 mt-2">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full ${
                      i <= Math.ceil((user.creditScore || 0) / 200) ? 'bg-blue-500' : 'bg-gray-200'
                    }`} />
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {(user.creditScore || 0) >= 700 ? '🟢 Сайн'
                    : (user.creditScore || 0) >= 500 ? '🟡 Дунд' : '🔴 Муу'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT col: Хэрэглэгчийн мэдээлэл */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-gray-800 to-gray-600 px-5 py-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-white bg-opacity-15 rounded-full flex items-center justify-center">
                <FiUser className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold">{pi.lastName} {pi.firstName || user.name || '—'}</p>
                <p className="text-gray-300 text-sm">{user.phoneNumber}</p>
              </div>
            </div>
            <div className="p-4">
              <InfoRow label="Регистр" value={pi.registerNumber} />
              <InfoRow label="Хүйс" value={pi.gender} />
              <InfoRow label="Боловсрол" value={pi.education} />
              <InfoRow label="KYC" value={
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(user.kycStatus)}`}>
                  {getStatusText(user.kycStatus)}
                </span>
              } />
            </div>
          </div>

          <SectionCard icon={FiBriefcase} title="Ажил & Орлого">
            <InfoRow label="Байдал" value={emp.status} />
            {emp.companyName && <InfoRow label="Байгууллага" value={emp.companyName} />}
            {emp.position && <InfoRow label="Албан тушаал" value={emp.position} />}
            <InfoRow label="Сарын орлого" value={income > 0 ? `${formatMoney(income)}₮` : null} accent />
          </SectionCard>

          <SectionCard icon={FiCreditCard} title="Банкны мэдээлэл">
            <InfoRow label="Банк" value={bank.bankName} />
            <InfoRow label="Данс" value={bank.accountNumber} accent />
            <InfoRow label="Эзэмшигч" value={bank.accountName} />
          </SectionCard>

          <SectionCard icon={FiMapPin} title="Хаяг">
            <InfoRow label="Хот/Аймаг" value={addr.city} />
            <InfoRow label="Дүүрэг" value={addr.district} />
            {addr.fullAddress && (
              <div className="pt-2.5 border-t border-gray-100 mt-1">
                <p className="text-xs text-gray-400 mb-1">Дэлгэрэнгүй хаяг</p>
                <p className="text-sm text-gray-700 leading-relaxed">{addr.fullAddress}</p>
              </div>
            )}
          </SectionCard>

          {emergency.name && (
            <SectionCard icon={FiPhone} title="Яаралтай холбоо">
              <InfoRow label="Нэр" value={emergency.name} />
              <InfoRow label="Хамаарал" value={emergency.relationship} />
              <InfoRow label="Утас" value={emergency.phoneNumber} accent />
            </SectionCard>
          )}

          {/* Decision hint */}
          <div className={`rounded-xl p-4 border ${
            risk === 'low'    ? 'bg-green-50 border-green-200'
            : risk === 'medium' ? 'bg-yellow-50 border-yellow-200'
            : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <FiInfo className={`w-4 h-4 flex-shrink-0 ${
                risk === 'low' ? 'text-green-600' : risk === 'medium' ? 'text-yellow-600' : 'text-red-600'
              }`} />
              <p className={`text-sm font-semibold ${
                risk === 'low' ? 'text-green-800' : risk === 'medium' ? 'text-yellow-800' : 'text-red-800'
              }`}>Шийдвэрийн зөвлөмж</p>
            </div>
            <ul className={`text-xs space-y-1 ${
              risk === 'low' ? 'text-green-700' : risk === 'medium' ? 'text-yellow-700' : 'text-red-700'
            }`}>
              {checks.filter(c => !c.ok).map(c => (
                <li key={c.label}>⚠ {c.label} — хангаагүй</li>
              ))}
              {checks.every(c => c.ok) && <li>✅ Бүх шалгуур хангагдсан байна</li>}
            </ul>
          </div>
        </div>
      </div>

      {/* REJECT MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <FiXCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Зээл татгалзах</h3>
                <p className="text-sm text-gray-500">
                  {formatMoney(loan.principal)}₮ — {pi.lastName} {pi.firstName || user.name}
                </p>
              </div>
            </div>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-4 min-h-[120px] resize-none focus:ring-2 focus:ring-red-400 focus:border-transparent text-sm"
              placeholder="Татгалзах шалтгаан... (жишээ: орлогын мэдээлэл хангалтгүй, зээлийн эрхээс хэтэрсэн)"
              autoFocus
            />
            <div className="flex gap-3 mt-4">
              <Button variant="secondary" onClick={() => setShowRejectModal(false)} className="flex-1">Болих</Button>
              <Button variant="danger" onClick={handleReject} loading={actionLoading} className="flex-1">
                <FiX className="mr-1.5 w-4 h-4" /> Татгалзах
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}