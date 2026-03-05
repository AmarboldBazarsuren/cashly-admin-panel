/**
 * UserDetailPage - Хэрэглэгчийн бүрэн дэлгэрэнгүй хуудас
 * БАЙРШИЛ: src/pages/users/UserDetailPage.jsx
 *
 * Харуулна:
 *  - KYC мэдээлэл (хувийн, ажил, банк, хаяг, баримт бичиг)
 *  - Хэтэвч (үлдэгдэл, түүх)
 *  - Идэвхтэй зээлүүд
 *  - Зээлийн бүрэн түүх
 *  - Засах боломж: creditLimit, creditScore, externalActiveLoansCount, adminNotes, block/unblock, bank info
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  FiArrowLeft, FiUser, FiBriefcase, FiCreditCard, FiMapPin,
  FiPhone, FiFileText, FiDollarSign, FiSave, FiAlertCircle,
  FiCheckCircle, FiEdit2, FiX, FiLock, FiUnlock, FiTrendingUp,
  FiClock, FiAlertTriangle, FiRefreshCw, FiShield
} from 'react-icons/fi'
import { getUserDetail, blockUser, unblockUser } from '../../services/userService'
import api from '../../services/api'
import { formatMoney, formatDateTime, getStatusColor, getStatusText } from '../../utils/formatters'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button'

// ── Туслах компонентүүд ───────────────────────────────────────

const InfoRow = ({ label, value, accent }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
    <span className="text-xs text-gray-500 uppercase tracking-wide font-medium flex-shrink-0">{label}</span>
    <span className={`text-sm font-semibold text-right ml-4 ${accent ? 'text-blue-600' : 'text-gray-900'}`}>
      {value || '—'}
    </span>
  </div>
)

const SectionCard = ({ icon: Icon, title, children, extra }) => (
  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
    <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-gray-400" />
        <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
      </div>
      {extra}
    </div>
    <div className="p-4">{children}</div>
  </div>
)

const LoanStatusBadge = ({ status }) => {
  const map = {
    pending:   { cls: 'bg-yellow-100 text-yellow-800', label: 'Хүлээгдэж байна' },
    active:    { cls: 'bg-blue-100 text-blue-800',     label: 'Идэвхтэй' },
    extended:  { cls: 'bg-purple-100 text-purple-800', label: 'Сунгасан' },
    overdue:   { cls: 'bg-red-100 text-red-800',       label: 'Хугацаа хэтэрсэн' },
    completed: { cls: 'bg-green-100 text-green-800',   label: 'Дууссан' },
    rejected:  { cls: 'bg-gray-100 text-gray-700',     label: 'Татгалзсан' },
  }
  const s = map[status] || { cls: 'bg-gray-100 text-gray-700', label: status }
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.cls}`}>{s.label}</span>
}

// ── Үндсэн компонент ─────────────────────────────────────────
export default function UserDetailPage() {
  const { userId } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [userData, setUserData]     = useState(null)
  const [wallet, setWallet]         = useState(null)
  const [loans, setLoans]           = useState([])
  const [stats, setStats]           = useState({})
  const [activeTab, setActiveTab]   = useState('info') // info | loans | wallet | edit

  // Edit form
  const [editForm, setEditForm] = useState({
    creditLimit: '',
    creditScore: '',
    externalActiveLoansCount: '',
    adminNotes: '',
    bankName: '',
    accountNumber: '',
    accountName: '',
  })

  useEffect(() => { load() }, [userId])

  const load = async () => {
    setLoading(true)
    try {
      const res = await getUserDetail(userId)
      if (res.success) {
        const u = res.data?.user || res.data
        const w = res.data?.wallet
        const l = res.data?.loans || []
        const s = res.data?.stats || {}
        setUserData(u)
        setWallet(w)
        setLoans(l)
        setStats(s)
        // Edit form default
        const pi = u.personalInfo || {}
        setEditForm({
          creditLimit: u.creditLimit || 0,
          creditScore: u.creditScore || 0,
          externalActiveLoansCount: u.externalActiveLoansCount || 0,
          adminNotes: u.adminNotes || '',
          bankName: pi.bankInfo?.bankName || '',
          accountNumber: pi.bankInfo?.accountNumber || '',
          accountName: pi.bankInfo?.accountName || '',
        })
      } else {
        toast.error('Хэрэглэгч олдсонгүй')
        navigate('/users')
      }
    } catch {
      toast.error('Мэдээлэл татахад алдаа гарлаа')
      navigate('/users')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveCredit = async () => {
    const cl = Number(editForm.creditLimit)
    const cs = Number(editForm.creditScore)
    const ext = Number(editForm.externalActiveLoansCount)

    if (cl < 0) { toast.error('Зээлийн эрх 0-ээс бага байж болохгүй'); return }
    if (cl > 0 && cl < 480000) { toast.error('Зээлийн эрх хамгийн багадаа 480,000₮ байх ёстой'); return }
    if (cs < 0 || cs > 1000) { toast.error('Credit score 0-1000 хооронд байх ёстой'); return }

    if (!confirm(`Зээлийн эрх: ${formatMoney(cl)}₮\nCredit score: ${cs}\nГадны зээл: ${ext}\n\nХадгалах уу?`)) return

    setSaving(true)
    try {
      const body = { creditLimit: cl }
      if (cs >= 0) body.creditScore = cs
      if (ext >= 0) body.externalActiveLoansCount = ext
      if (editForm.adminNotes) body.notes = editForm.adminNotes

      const res = await api.post(`/admin/set-credit-limit/${userId}`, body)
      if (res.success) {
        toast.success('Зээлийн мэдээлэл шинэчлэгдлээ ✅')
        load()
      } else {
        toast.error(res.message || 'Алдаа гарлаа')
      }
    } catch (e) {
      toast.error(e?.message || 'Хадгалахад алдаа гарлаа')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveBank = async () => {
    if (!editForm.bankName || !editForm.accountNumber) {
      toast.error('Банк болон дансны дугаар шаардлагатай')
      return
    }
    setSaving(true)
    try {
      const res = await api.put(`/admin/user/${userId}/update-bank`, {
        bankName: editForm.bankName,
        accountNumber: editForm.accountNumber,
        accountName: editForm.accountName,
      })
      if (res.success) {
        toast.success('Банкны мэдээлэл шинэчлэгдлээ ✅')
        load()
      } else {
        toast.error(res.message || 'Алдаа гарлаа')
      }
    } catch (e) {
      toast.error(e?.message || 'Хадгалахад алдаа гарлаа')
    } finally {
      setSaving(false)
    }
  }

  const handleBlock = async () => {
    const isBlocked = userData.status === 'blocked'
    if (!confirm(isBlocked ? 'Хэрэглэгчийг идэвхжүүлэх үү?' : 'Хэрэглэгчийг блоклох уу?')) return
    try {
      const res = isBlocked ? await unblockUser(userId) : await blockUser(userId)
      if (res.success) {
        toast.success(isBlocked ? 'Хэрэглэгч идэвхжүүллээ' : 'Хэрэглэгч блоклогдлоо')
        load()
      } else {
        toast.error(res.message || 'Алдаа гарлаа')
      }
    } catch { toast.error('Алдаа гарлаа') }
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
  const activeLoans = loans.filter(l => ['active', 'extended', 'overdue'].includes(l.status))
  const income = emp.monthlyIncome || 0

  const TABS = [
    { key: 'info',   label: 'KYC Мэдээлэл' },
    { key: 'loans',  label: `Зээлүүд (${loans.length})` },
    { key: 'wallet', label: 'Хэтэвч' },
    { key: 'edit',   label: '✏️ Засах' },
  ]

  return (
    <div className="space-y-6 pb-12">

      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/users')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <FiArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">
                {pi.lastName} {pi.firstName || userData.name}
              </h1>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                userData.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {userData.status === 'active' ? '● Идэвхтэй' : '● Блоклогдсон'}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(userData.kycStatus)}`}>
                KYC: {getStatusText(userData.kycStatus)}
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-1">{userData.phoneNumber} • {userData.email || '—'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Шинэчлэх">
            <FiRefreshCw className="w-5 h-5 text-gray-600" />
          </button>
          <Button
            variant={userData.status === 'active' ? 'danger' : 'success'}
            size="sm"
            onClick={handleBlock}
          >
            {userData.status === 'active'
              ? <><FiLock className="mr-1.5 w-4 h-4" />Блоклох</>
              : <><FiUnlock className="mr-1.5 w-4 h-4" />Идэвхжүүлэх</>
            }
          </Button>
        </div>
      </div>

      {/* STATS STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Зээлийн эрх',     value: `${formatMoney(userData.creditLimit)}₮`,          color: 'text-blue-600' },
          { label: 'Credit Score',     value: userData.creditScore || 0,                        color: 'text-purple-600' },
          { label: 'Идэвхтэй зээл',   value: `${activeLoans.length} зээл`,                    color: 'text-orange-600' },
          { label: 'Хэтэвч',          value: `${formatMoney(wallet?.balance || 0)}₮`,          color: 'text-green-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* TABS */}
      <div className="border-b border-gray-200 bg-white rounded-t-xl shadow-sm">
        <div className="flex gap-0 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-6 py-3.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === t.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB: KYC Мэдээлэл ── */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

          {/* Үндсэн мэдээлэл */}
          <SectionCard icon={FiUser} title="Үндсэн мэдээлэл">
            <InfoRow label="Нэр"         value={`${pi.lastName || ''} ${pi.firstName || userData.name || ''}`} />
            <InfoRow label="Утас"        value={userData.phoneNumber} accent />
            <InfoRow label="Регистр"     value={pi.registerNumber} />
            <InfoRow label="Хүйс"        value={pi.gender} />
            <InfoRow label="Боловсрол"   value={pi.education} />
            <InfoRow label="Email"       value={userData.email} />
            <InfoRow label="Бүртгэсэн"  value={formatDateTime(userData.createdAt)} />
            <InfoRow label="Сүүлд нэвтэрсэн" value={formatDateTime(userData.lastLogin)} />
          </SectionCard>

          {/* Ажил & Орлого */}
          <SectionCard icon={FiBriefcase} title="Ажил & Орлого">
            <InfoRow label="Байдал"      value={emp.status} />
            <InfoRow label="Байгууллага" value={emp.companyName} />
            <InfoRow label="Албан тушаал" value={emp.position} />
            <InfoRow label="Сарын орлого" value={income > 0 ? `${formatMoney(income)}₮` : null} accent />
          </SectionCard>

          {/* Банкны мэдээлэл */}
          <SectionCard icon={FiCreditCard} title="Банкны мэдээлэл">
            <InfoRow label="Банк"           value={bank.bankName} />
            <InfoRow label="Дансны дугаар" value={bank.accountNumber} accent />
            <InfoRow label="Эзэмшигч"      value={bank.accountName} />
          </SectionCard>

          {/* Хаяг */}
          <SectionCard icon={FiMapPin} title="Хаяг">
            <InfoRow label="Хот/Аймаг" value={addr.city} />
            <InfoRow label="Дүүрэг"    value={addr.district} />
            <InfoRow label="Хороо"     value={addr.khoroo} />
            {addr.fullAddress && (
              <div className="pt-2 border-t border-gray-100 mt-1">
                <p className="text-xs text-gray-400 mb-1">Дэлгэрэнгүй хаяг</p>
                <p className="text-sm text-gray-700">{addr.fullAddress}</p>
              </div>
            )}
          </SectionCard>

          {/* Яаралтай холбоо */}
          {emergency.name && (
            <SectionCard icon={FiPhone} title="Яаралтай холбоо">
              <InfoRow label="Нэр"        value={emergency.name} />
              <InfoRow label="Хамаарал"  value={emergency.relationship} />
              <InfoRow label="Утас"      value={emergency.phoneNumber} accent />
            </SectionCard>
          )}

          {/* KYC Статус */}
          <SectionCard icon={FiShield} title="KYC Статус">
            <InfoRow label="KYC Статус"      value={getStatusText(userData.kycStatus)} />
            <InfoRow label="Илгээсэн"        value={formatDateTime(userData.kycSubmittedAt)} />
            <InfoRow label="Зөвшөөрсөн"      value={formatDateTime(userData.kycApprovedAt)} />
            {userData.kycRejectedReason && (
              <InfoRow label="Татгалзах шалтгаан" value={userData.kycRejectedReason} />
            )}
            <InfoRow label="Зээлийн эрх шалгах" value={userData.creditCheckPaid ? `✓ Төлсөн (${formatDateTime(userData.creditCheckPaidAt)})` : '✗ Төлөөгүй'} />
          </SectionCard>

          {/* Баримт бичгүүд */}
          <div className="xl:col-span-2">
            <SectionCard icon={FiFileText} title="Баримт бичгүүд">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { key: 'idCardFront', label: 'Үнэмлэх (Нүүр)' },
                  { key: 'idCardBack',  label: 'Үнэмлэх (Ар)' },
                  { key: 'selfie',      label: 'Селфи' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <p className="text-xs text-gray-500 mb-2">{label}</p>
                    {docs[key]?.url ? (
                      <a href={docs[key].url} target="_blank" rel="noopener noreferrer">
                        <img
                          src={docs[key].url}
                          alt={label}
                          className="w-full h-36 object-cover rounded-lg border border-gray-200 hover:opacity-90 transition-opacity cursor-pointer"
                        />
                      </a>
                    ) : (
                      <div className="w-full h-36 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                        <p className="text-gray-400 text-xs">Байхгүй</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {/* ── TAB: Зээлүүд ── */}
      {activeTab === 'loans' && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Нийт зээл',    value: loans.length,                                                                       color: 'text-gray-900' },
              { label: 'Идэвхтэй',     value: activeLoans.length,                                                                 color: 'text-blue-600' },
              { label: 'Дууссан',      value: loans.filter(l => l.status === 'completed').length,                                 color: 'text-green-600' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {loans.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
              <FiDollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Зээлийн түүх байхгүй байна</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дугаар</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дүн</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Нийт</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Хугацаа</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дуусах</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Огноо</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loans.map(loan => (
                      <tr key={loan._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <Link to={`/loans/${loan._id}`} className="text-xs font-mono text-blue-600 hover:underline">
                            {loan.loanNumber}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-gray-900">{formatMoney(loan.principal)}₮</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{formatMoney(loan.totalAmount)}₮</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{loan.term} хоног</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {loan.dueDate ? formatDateTime(loan.dueDate) : '—'}
                        </td>
                        <td className="px-4 py-3"><LoanStatusBadge status={loan.status} /></td>
                        <td className="px-4 py-3 text-xs text-gray-500">{formatDateTime(loan.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: Хэтэвч ── */}
      {activeTab === 'wallet' && (
        <div className="space-y-5">
          {/* Wallet balance cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: 'Нийт үлдэгдэл',         value: `${formatMoney(wallet?.balance || 0)}₮`,          color: 'text-green-600',  bg: 'bg-green-50' },
              { label: 'Боломжит үлдэгдэл',      value: `${formatMoney((wallet?.balance || 0) - (wallet?.frozenBalance || 0))}₮`, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Түгжигдсэн',             value: `${formatMoney(wallet?.frozenBalance || 0)}₮`,    color: 'text-orange-600', bg: 'bg-orange-50' },
              { label: 'Нийт цэнэглэсэн',        value: `${formatMoney(wallet?.totalDeposited || 0)}₮`,  color: 'text-gray-700',   bg: 'bg-gray-50' },
              { label: 'Нийт зарцуулсан',        value: `${formatMoney(wallet?.totalWithdrawn || 0)}₮`,  color: 'text-red-600',    bg: 'bg-red-50' },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`${bg} border border-gray-200 rounded-xl p-4 text-center`}>
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className={`text-xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {!wallet && (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
              <p className="text-gray-400">Хэтэвчний мэдээлэл байхгүй</p>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: Засах ── */}
      {activeTab === 'edit' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* Зээлийн мэдээлэл засах */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-4">
              <h3 className="font-bold text-white flex items-center gap-2">
                <FiShield className="w-5 h-5" />
                Зээлийн мэдээлэл
              </h3>
              <p className="text-blue-200 text-xs mt-1">Зээлийн эрх, Credit score, Admin тэмдэглэл</p>
            </div>
            <div className="p-5 space-y-4">

              {/* Credit Limit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Зээлийн эрх (₮) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={editForm.creditLimit}
                  onChange={e => setEditForm(f => ({ ...f, creditLimit: e.target.value }))}
                  min="0"
                  step="10000"
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base font-semibold"
                />
                <p className="text-xs text-gray-400 mt-1">Хамгийн бага: 480,000₮ эсвэл 0₮ (эрх олгохгүй)</p>
                {/* Quick buttons */}
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {[480000, 1000000, 2000000, 5000000].map(v => (
                    <button
                      key={v}
                      onClick={() => setEditForm(f => ({ ...f, creditLimit: v }))}
                      className="px-2 py-1.5 bg-gray-100 hover:bg-blue-100 hover:text-blue-700 rounded-lg text-xs font-medium transition-colors"
                    >
                      {v >= 1000000 ? `${v/1000000}M` : `${v/1000}K`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Credit Score */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Credit Score (0-1000)
                </label>
                <input
                  type="number"
                  value={editForm.creditScore}
                  onChange={e => setEditForm(f => ({ ...f, creditScore: e.target.value }))}
                  min="0"
                  max="1000"
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {/* Quick score buttons */}
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {[
                    { label: '200 - Муу',   value: 200 },
                    { label: '500 - Дунд',  value: 500 },
                    { label: '750 - Сайн',  value: 750 },
                  ].map(({ label, value }) => (
                    <button
                      key={value}
                      onClick={() => setEditForm(f => ({ ...f, creditScore: value }))}
                      className="px-2 py-1.5 bg-gray-100 hover:bg-purple-100 hover:text-purple-700 rounded-lg text-xs font-medium transition-colors"
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>0</span>
                    <span className={`font-semibold ${
                      Number(editForm.creditScore) >= 700 ? 'text-green-600'
                      : Number(editForm.creditScore) >= 500 ? 'text-yellow-600'
                      : 'text-red-600'
                    }`}>
                      {Number(editForm.creditScore) >= 700 ? '🟢 Сайн'
                        : Number(editForm.creditScore) >= 500 ? '🟡 Дунд'
                        : '🔴 Муу'}
                    </span>
                    <span>1000</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        Number(editForm.creditScore) >= 700 ? 'bg-green-500'
                        : Number(editForm.creditScore) >= 500 ? 'bg-yellow-500'
                        : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(100, (Number(editForm.creditScore) / 1000) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* External loans */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Гадны идэвхтэй зээлийн тоо (ZMS)
                </label>
                <input
                  type="number"
                  value={editForm.externalActiveLoansCount}
                  onChange={e => setEditForm(f => ({ ...f, externalActiveLoansCount: e.target.value }))}
                  min="0"
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {Number(editForm.externalActiveLoansCount) >= 5 && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                    <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>5 болон түүнээс дээш зээлтэй бол шинэ зээл авах боломжгүй (ZMS)</span>
                  </div>
                )}
              </div>

              {/* Admin Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Админ тэмдэглэл
                </label>
                <textarea
                  value={editForm.adminNotes}
                  onChange={e => setEditForm(f => ({ ...f, adminNotes: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
                  placeholder="ZMS тэмдэглэл, кредитийн шинжилгээ..."
                />
              </div>

              {/* Preview */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <p className="text-xs text-blue-600 font-medium mb-2">Шинэчлэх утгууд:</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs text-gray-500">Зээлийн эрх</p>
                    <p className="text-sm font-bold text-blue-700">{formatMoney(Number(editForm.creditLimit) || 0)}₮</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Credit score</p>
                    <p className="text-sm font-bold text-purple-700">{editForm.creditScore || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Гадны зээл</p>
                    <p className="text-sm font-bold text-orange-700">{editForm.externalActiveLoansCount || 0}</p>
                  </div>
                </div>
              </div>

              <Button
                variant="success"
                onClick={handleSaveCredit}
                loading={saving}
                className="w-full py-3"
              >
                <FiSave className="mr-2 w-4 h-4" />
                Зээлийн мэдээлэл хадгалах
              </Button>
            </div>
          </div>

          {/* Банкны мэдээлэл засах */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-5 py-4">
              <h3 className="font-bold text-white flex items-center gap-2">
                <FiCreditCard className="w-5 h-5" />
                Банкны мэдээлэл засах
              </h3>
              <p className="text-gray-300 text-xs mt-1">Дансны дугаар, банкны нэр шинэчлэх</p>
            </div>
            <div className="p-5 space-y-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Банк</label>
                <select
                  value={editForm.bankName}
                  onChange={e => setEditForm(f => ({ ...f, bankName: e.target.value }))}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Банк сонгох</option>
                  {[
                    'Хаан банк', 'Төрийн банк', 'Голомт банк', 'Хас банк',
                    'Капитрон банк', 'Ариг банк', 'Богд банк',
                    'Чингис хаан банк', 'Худалдаа хөгжлийн банк',
                    'Үндэсний хөрөнгө оруулалтын банк'
                  ].map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Дансны дугаар</label>
                <input
                  type="text"
                  value={editForm.accountNumber}
                  onChange={e => setEditForm(f => ({ ...f, accountNumber: e.target.value }))}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Дансны дугаар"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Данс эзэмшигч</label>
                <input
                  type="text"
                  value={editForm.accountName}
                  onChange={e => setEditForm(f => ({ ...f, accountName: e.target.value }))}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Нэр"
                />
              </div>

              {/* Current bank info */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-xs text-gray-500 font-medium mb-2">Одоогийн банкны мэдээлэл:</p>
                <p className="text-sm text-gray-700">{bank.bankName || '—'}</p>
                <p className="text-sm font-semibold text-gray-900">{bank.accountNumber || '—'}</p>
                <p className="text-xs text-gray-500">{bank.accountName || '—'}</p>
              </div>

              <Button
                variant="primary"
                onClick={handleSaveBank}
                loading={saving}
                className="w-full py-3"
              >
                <FiSave className="mr-2 w-4 h-4" />
                Банкны мэдээлэл хадгалах
              </Button>
            </div>

            {/* Block/Unblock section */}
            <div className="px-5 pb-5">
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Хэрэглэгчийн статус</p>
                <div className={`flex items-center justify-between p-4 rounded-xl border ${
                  userData.status === 'active'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div>
                    <p className={`font-semibold text-sm ${userData.status === 'active' ? 'text-green-800' : 'text-red-800'}`}>
                      {userData.status === 'active' ? '● Идэвхтэй' : '● Блоклогдсон'}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {userData.status === 'active' ? 'Хэрэглэгч апп ашиглаж байна' : 'Хэрэглэгч нэвтрэх боломжгүй'}
                    </p>
                  </div>
                  <Button
                    variant={userData.status === 'active' ? 'danger' : 'success'}
                    size="sm"
                    onClick={handleBlock}
                  >
                    {userData.status === 'active'
                      ? <><FiLock className="mr-1 w-4 h-4" /> Блоклох</>
                      : <><FiUnlock className="mr-1 w-4 h-4" /> Идэвхжүүлэх</>
                    }
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}