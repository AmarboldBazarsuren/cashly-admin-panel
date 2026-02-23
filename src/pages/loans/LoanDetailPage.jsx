/**
 * LoanDetailPage.jsx — Зээлийн дэлгэрэнгүй ХАРАХ хуудас
 * БАЙРШИЛ: src/pages/loans/LoanDetailPage.jsx
 *
 * status: active | completed | overdue | rejected | extended
 * Зорилго: Зээлийн явц, төлбөрийн мэдээлэл, огноо харах. Засах үйлдэл байхгүй.
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  FiArrowLeft, FiUser, FiCreditCard, FiCalendar,
  FiTrendingUp, FiClock, FiCheckCircle, FiXCircle,
  FiAlertTriangle, FiDollarSign,
} from 'react-icons/fi'
import { getLoanDetail } from '../../services/loanService'
import { formatMoney, formatDateTime, getStatusColor, getStatusText } from '../../utils/formatters'
import toast from 'react-hot-toast'

// ── Туслах компонентүүд ───────────────────────────────────────

const InfoRow = ({ label, value, accent }) => (
  <div className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0">
    <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">{label}</span>
    <span className={`text-sm font-semibold ${accent ? 'text-blue-600' : 'text-gray-900'}`}>
      {value || '—'}
    </span>
  </div>
)

const StatBox = ({ label, value, sub, color = 'text-gray-900', bg = 'bg-gray-50' }) => (
  <div className={`${bg} rounded-xl p-4 text-center`}>
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <p className={`text-xl font-bold ${color}`}>{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
  </div>
)

const StatusIcon = ({ status }) => {
  if (status === 'completed') return <FiCheckCircle className="w-5 h-5 text-green-500" />
  if (status === 'rejected')  return <FiXCircle className="w-5 h-5 text-red-500" />
  if (status === 'overdue')   return <FiAlertTriangle className="w-5 h-5 text-red-500" />
  if (status === 'active')    return <FiTrendingUp className="w-5 h-5 text-blue-500" />
  return <FiClock className="w-5 h-5 text-gray-400" />
}

// ── Үндсэн компонент ─────────────────────────────────────────
export default function LoanDetailPage() {
  const { loanId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [loan, setLoan] = useState(null)

  useEffect(() => { load() }, [loanId])

  const load = async () => {
    setLoading(true)
    try {
      const res = await getLoanDetail(loanId)
      if (res.success) {
        const data = res.data?.loan || res.data
        // pending бол review page руу redirect
        if (data.status === 'pending') {
          navigate(`/loans/review/${loanId}`, { replace: true })
          return
        }
        setLoan(data)
      } else {
        toast.error('Зээлийн мэдээлэл олдсонгүй')
        navigate('/loans')
      }
    } catch {
      toast.error('Татахад алдаа гарлаа')
      navigate('/loans')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
    </div>
  )
  if (!loan) return null

  const user = loan.user || {}
  const pi = user.personalInfo || {}
  const bank = pi.bankInfo || {}
  const isActive = ['active', 'extended', 'overdue'].includes(loan.status)
  const paidPct = loan.totalAmount > 0
    ? Math.min(100, Math.round(((loan.paidAmount || 0) / loan.totalAmount) * 100))
    : 0

  return (
    <div className="space-y-6 pb-12">

      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/loans')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <FiArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <StatusIcon status={loan.status} />
              <h1 className="text-2xl font-bold text-gray-900">Зээлийн дэлгэрэнгүй</h1>
              <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${getStatusColor(loan.status)}`}>
                {getStatusText(loan.status)}
              </span>
            </div>
            <p className="text-gray-400 text-xs mt-1 font-mono">{loan.loanNumber}</p>
          </div>
        </div>
      </div>

      {/* Rejected reason banner */}
      {loan.status === 'rejected' && loan.rejectedReason && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 flex gap-3">
          <FiXCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800 mb-0.5">Татгалзсан шалтгаан</p>
            <p className="text-sm text-red-700">{loan.rejectedReason}</p>
          </div>
        </div>
      )}

      {/* Overdue warning */}
      {loan.status === 'overdue' && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl px-5 py-4 flex gap-3">
          <FiAlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-orange-800 mb-0.5">Зээлийн хугацаа хэтэрсэн</p>
            <p className="text-sm text-orange-700">Хэрэглэгчтэй холбогдож нөхцөл байдлыг тодруулна уу.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* LEFT col */}
        <div className="xl:col-span-2 space-y-5">

          {/* Loan summary */}
          <div className={`rounded-2xl p-6 text-white shadow-lg ${
            loan.status === 'completed' ? 'bg-gradient-to-br from-green-600 to-green-800'
            : loan.status === 'overdue' ? 'bg-gradient-to-br from-red-600 to-red-800'
            : loan.status === 'rejected' ? 'bg-gradient-to-br from-gray-600 to-gray-800'
            : 'bg-gradient-to-br from-blue-600 to-blue-900'
          }`}>
            <p className="text-white text-opacity-70 text-xs uppercase tracking-widest mb-4 font-medium">
              Зээлийн мэдээлэл
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              <div>
                <p className="text-white text-opacity-60 text-xs mb-1">Зээлийн дүн</p>
                <p className="text-3xl font-bold">{formatMoney(loan.principal)}₮</p>
              </div>
              <div>
                <p className="text-white text-opacity-60 text-xs mb-1">Нийт төлөх</p>
                <p className="text-2xl font-bold text-yellow-300">{formatMoney(loan.totalAmount)}₮</p>
              </div>
              <div>
                <p className="text-white text-opacity-60 text-xs mb-1">Хугацаа</p>
                <p className="text-2xl font-bold">{loan.term} <span className="text-base font-normal opacity-70">хоног</span></p>
              </div>
              <div>
                <p className="text-white text-opacity-60 text-xs mb-1">Хүүний хувь</p>
                <p className="text-2xl font-bold">{loan.interestRate}<span className="text-base font-normal opacity-70">%</span></p>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-white border-opacity-20 flex flex-wrap gap-x-6 gap-y-1 text-xs text-white text-opacity-60">
              <span>Хүүний дүн: <strong className="text-white text-opacity-100">{formatMoney(loan.interestAmount)}₮</strong></span>
              <span>Зориулалт: <strong className="text-white text-opacity-100">{loan.purpose || 'Хувийн'}</strong></span>
              {loan.approvedAt && <span>Зөвшөөрсөн: <strong className="text-white text-opacity-100">{formatDateTime(loan.approvedAt)}</strong></span>}
            </div>
          </div>

          {/* Payment progress (active/overdue/extended only) */}
          {isActive && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                <FiTrendingUp className="w-4 h-4 text-gray-500" />
                <h3 className="font-semibold text-gray-800">Төлбөрийн явц</h3>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                  <StatBox
                    label="Нийт төлбөр"
                    value={`${formatMoney(loan.totalAmount)}₮`}
                    bg="bg-gray-50"
                  />
                  <StatBox
                    label="Төлсөн дүн"
                    value={`${formatMoney(loan.paidAmount || 0)}₮`}
                    color="text-green-600"
                    bg="bg-green-50"
                  />
                  <StatBox
                    label="Үлдэгдэл"
                    value={`${formatMoney(loan.remainingAmount || 0)}₮`}
                    color="text-red-600"
                    bg="bg-red-50"
                  />
                  <StatBox
                    label="Сунгасан"
                    value={`${loan.extensionCount || 0} удаа`}
                    bg="bg-gray-50"
                  />
                </div>
                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                    <span>Төлөлтийн явц</span>
                    <span className="font-semibold text-gray-700">{paidPct}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        loan.status === 'overdue' ? 'bg-red-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${paidPct}%` }}
                    />
                  </div>
                </div>
                {/* Due date */}
                {loan.dueDate && (
                  <div className={`mt-4 px-4 py-3 rounded-lg flex items-center gap-2 ${
                    loan.status === 'overdue' ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-100'
                  }`}>
                    <FiCalendar className={`w-4 h-4 ${loan.status === 'overdue' ? 'text-red-500' : 'text-blue-500'}`} />
                    <span className="text-sm">
                      Дуусах огноо:{' '}
                      <strong className={loan.status === 'overdue' ? 'text-red-700' : 'text-blue-700'}>
                        {formatDateTime(loan.dueDate)}
                      </strong>
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Completed summary */}
          {loan.status === 'completed' && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-start gap-3">
              <FiCheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-800 mb-1">Зээл амжилттай төлөгдсөн</p>
                <p className="text-sm text-green-700">
                  Нийт {formatMoney(loan.totalAmount)}₮ ({formatMoney(loan.principal)}₮ + хүү {formatMoney(loan.interestAmount)}₮) бүрэн төлөгдсөн.
                  {loan.completedAt && ` Дууссан огноо: ${formatDateTime(loan.completedAt)}`}
                </p>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
              <FiClock className="w-4 h-4 text-gray-400" />
              <h3 className="font-semibold text-gray-800">Огноо мэдээлэл</h3>
            </div>
            <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Хүсэлт илгээсэн',  val: loan.createdAt },
                { label: 'Зөвшөөрөгдсөн',    val: loan.approvedAt },
                { label: 'Мөнгө олгосон',     val: loan.disbursedAt },
                { label: 'Дуусах огноо',      val: loan.dueDate },
                { label: 'Дууссан огноо',     val: loan.completedAt },
                { label: 'Татгалзсан огноо',  val: loan.rejectedAt },
              ].filter(i => i.val).map(({ label, val }) => (
                <div key={label} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 uppercase mb-1">{label}</p>
                  <p className="text-sm font-semibold text-gray-800">{formatDateTime(val)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT col: Хэрэглэгчийн мэдээлэл */}
        <div className="space-y-4">

          {/* User card */}
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
              <InfoRow label="KYC Төлөв" value={
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(user.kycStatus)}`}>
                  {getStatusText(user.kycStatus)}
                </span>
              } />
              <InfoRow label="Зээлийн эрх" value={`${formatMoney(user.creditLimit || 0)}₮`} accent />
              <InfoRow label="Кредит оноо" value={`${user.creditScore || 0} оноо`} />
            </div>
          </div>

          {/* Bank info */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
              <FiCreditCard className="w-4 h-4 text-gray-400" />
              <h3 className="font-semibold text-gray-800 text-sm">Банкны мэдээлэл</h3>
            </div>
            <div className="p-4">
              <InfoRow label="Банк" value={bank.bankName} />
              <InfoRow label="Данс" value={bank.accountNumber} accent />
              <InfoRow label="Эзэмшигч" value={bank.accountName} />
            </div>
          </div>

          {/* Loan stats summary */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
              <FiDollarSign className="w-4 h-4 text-gray-400" />
              <h3 className="font-semibold text-gray-800 text-sm">Зээлийн хураангуй</h3>
            </div>
            <div className="p-4">
              <InfoRow label="Зээлийн дүн"  value={`${formatMoney(loan.principal)}₮`} />
              <InfoRow label="Хүүний дүн"   value={`${formatMoney(loan.interestAmount)}₮`} />
              <InfoRow label="Нийт төлөх"   value={`${formatMoney(loan.totalAmount)}₮`} accent />
              {isActive && (
                <>
                  <InfoRow label="Төлсөн"    value={`${formatMoney(loan.paidAmount || 0)}₮`} />
                  <InfoRow label="Үлдэгдэл"  value={`${formatMoney(loan.remainingAmount || 0)}₮`} />
                </>
              )}
              <InfoRow label="Хугацаа"      value={`${loan.term} хоног`} />
              <InfoRow label="Зориулалт"    value={loan.purpose || 'Хувийн'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}