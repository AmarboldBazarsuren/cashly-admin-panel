import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiUsers, FiFileText, FiDollarSign, FiTrendingUp } from 'react-icons/fi'
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
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
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
      </Card>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FiUsers}
          title="Нийт хэрэглэгч"
          value={stats?.totalUsers || 0}
          subtitle={`Идэвхтэй: ${stats?.activeUsers || 0}`}
          color="bg-blue-500"
          link="/users"
        />
        
        <StatCard
          icon={FiFileText}
          title="KYC хүсэлт"
          value={stats?.pendingKYC || 0}
          subtitle="Хүлээгдэж буй"
          color="bg-yellow-500"
          link="/kyc"
        />
        
        <StatCard
          icon={FiDollarSign}
          title="Зээлийн хүсэлт"
          value={stats?.pendingLoans || 0}
          subtitle="Шинэ хүсэлт"
          color="bg-green-500"
          link="/loans"
        />
        
        <StatCard
          icon={FiTrendingUp}
          title="Идэвхтэй зээл"
          value={stats?.activeLoans || 0}
          subtitle={`${formatMoney(stats?.totalLoanAmount || 0)}₮`}
          color="bg-purple-500"
          link="/loans?status=active"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Сүүлийн KYC хүсэлтүүд">
          <div className="space-y-3">
            {stats?.recentKYC?.length > 0 ? (
              stats.recentKYC.map((kyc) => (
                <Link
                  key={kyc.user_id}
                  to={`/kyc/${kyc.user_id}`}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">{kyc.phone}</p>
                    <p className="text-sm text-gray-500">{kyc.email}</p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                    Хүлээгдэж байна
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">Хүсэлт байхгүй</p>
            )}
          </div>
        </Card>

        <Card title="Сүүлийн зээлийн хүсэлтүүд">
          <div className="space-y-3">
            {stats?.recentLoans?.length > 0 ? (
              stats.recentLoans.map((loan) => (
                <Link
                  key={loan.loan_id}
                  to={`/loans/${loan.loan_id}`}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">{loan.phone}</p>
                    <p className="text-sm text-gray-500">{formatMoney(loan.amount)}₮</p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                    Шинэ
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">Хүсэлт байхгүй</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage
