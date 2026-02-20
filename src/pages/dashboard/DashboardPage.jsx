import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiUsers, FiFileText, FiDollarSign, FiTrendingUp, FiCreditCard, FiAlertCircle } from 'react-icons/fi'
import { getDashboardStats } from '../../services/dashboardService'
import Card from '../../components/common/Card'
import { formatMoney } from '../../utils/formatters'
import toast from 'react-hot-toast'

const DashboardPage = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await getDashboardStats()
      if (response.success) {
        // Backend: response.data = { users, kyc, loans, loanAmounts, withdrawals, wallet, today }
        setStats(response.data)
      }
    } catch (error) {
      toast.error('Статистик татахад алдаа гарлаа')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const StatCard = ({ icon: Icon, title, value, subtitle, color, link }) => (
    <Link to={link}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
          <div className={`p-4 rounded-full ${color}`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
    </Link>
  )

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Системийн ерөнхий мэдээлэл</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          icon={FiUsers}
          title="Нийт хэрэглэгч"
          value={stats?.users?.total || 0}
          subtitle={`Идэвхтэй: ${stats?.users?.active || 0}`}
          color="bg-blue-500"
          link="/users"
        />
        <StatCard
          icon={FiFileText}
          title="KYC хүсэлт"
          value={stats?.kyc?.pending || 0}
          subtitle="Хүлээгдэж буй"
          color="bg-yellow-500"
          link="/kyc"
        />
        <StatCard
          icon={FiDollarSign}
          title="Зээлийн хүсэлт"
          value={stats?.loans?.pending || 0}
          subtitle="Шинэ хүсэлт"
          color="bg-green-500"
          link="/loans"
        />
        <StatCard
          icon={FiTrendingUp}
          title="Идэвхтэй зээл"
          value={stats?.loans?.active || 0}
          subtitle={`${formatMoney(stats?.loanAmounts?.totalOutstanding || 0)}₮`}
          color="bg-purple-500"
          link="/loans?status=active"
        />
        <StatCard
          icon={FiCreditCard}
          title="Мөнгө авалт"
          value={stats?.withdrawals?.pending || 0}
          subtitle="Хүлээгдэж буй"
          color="bg-orange-500"
          link="/withdrawals"
        />
        <StatCard
          icon={FiAlertCircle}
          title="Хугацаа хэтэрсэн"
          value={stats?.loans?.overdue || 0}
          subtitle="Зээл"
          color="bg-red-500"
          link="/loans?status=overdue"
        />
      </div>

      {/* Money Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Нийт олгосон зээл</p>
          <h3 className="text-2xl font-bold text-gray-900">{formatMoney(stats?.loanAmounts?.totalDisbursed || 0)}₮</h3>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Үлдэгдэл төлбөр</p>
          <h3 className="text-2xl font-bold text-orange-600">{formatMoney(stats?.loanAmounts?.totalOutstanding || 0)}₮</h3>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Хэтэвчний нийт үлдэгдэл</p>
          <h3 className="text-2xl font-bold text-green-600">{formatMoney(stats?.wallet?.totalBalance || 0)}₮</h3>
        </div>
      </div>

      {/* Today Stats */}
      <Card title="Өнөөдрийн мэдээлэл">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{stats?.today?.newUsers || 0}</p>
            <p className="text-sm text-gray-600 mt-1">Шинэ хэрэглэгч</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{stats?.today?.transactions || 0}</p>
            <p className="text-sm text-gray-600 mt-1">Гүйлгээ</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">{stats?.kyc?.pending || 0}</p>
            <p className="text-sm text-gray-600 mt-1">KYC хүлээгдэж буй</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{stats?.loans?.completed || 0}</p>
            <p className="text-sm text-gray-600 mt-1">Дууссан зээл</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default DashboardPage