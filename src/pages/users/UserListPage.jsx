import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiEye, FiSearch, FiRefreshCw, FiLock, FiUnlock } from 'react-icons/fi'
import { getAllUsers, blockUser, unblockUser } from '../../services/userService'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import { formatDateTime, formatMoney, getStatusColor, getStatusText } from '../../utils/formatters'
import toast from 'react-hot-toast'

const UserListPage = () => {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [kycFilter, setKycFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetchUsers()
  }, [page, statusFilter, kycFilter])

  const fetchUsers = async (searchTerm = search) => {
    setLoading(true)
    try {
      const response = await getAllUsers(page, searchTerm, statusFilter, kycFilter)
      if (response.success) {
        setUsers(response.data?.users || [])
        setTotalPages(response.pages || 1)
        setTotal(response.total || 0)
      }
    } catch (error) {
      toast.error('Хэрэглэгчид татахад алдаа гарлаа')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchUsers(search)
  }

  const handleBlock = async (userId, currentStatus) => {
    const isBlocking = currentStatus !== 'blocked'
    if (!confirm(isBlocking ? 'Хэрэглэгчийг блоклох уу?' : 'Хэрэглэгчийг идэвхжүүлэх үү?')) return

    try {
      const response = isBlocking ? await blockUser(userId) : await unblockUser(userId)
      if (response.success) {
        toast.success(isBlocking ? 'Хэрэглэгч блоклогдлоо' : 'Хэрэглэгч идэвхжүүллээ')
        fetchUsers()
      } else {
        toast.error(response.message || 'Алдаа гарлаа')
      }
    } catch (error) {
      toast.error('Алдаа гарлаа')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Хэрэглэгчид</h1>
          <p className="text-gray-600 mt-1">Нийт: {total} хэрэглэгч</p>
        </div>
        <button onClick={() => fetchUsers()} className="p-2 hover:bg-gray-100 rounded-lg">
          <FiRefreshCw className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Утас эсвэл нэрээр хайх..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-64"
          />
          <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            <FiSearch className="w-4 h-4" />
          </button>
        </form>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Бүх статус</option>
          <option value="active">Идэвхтэй</option>
          <option value="blocked">Блоклогдсон</option>
        </select>

        {/* KYC filter */}
        <select
          value={kycFilter}
          onChange={(e) => { setKycFilter(e.target.value); setPage(1) }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Бүх KYC</option>
          <option value="not_submitted">Илгээгээгүй</option>
          <option value="pending">Хүлээгдэж буй</option>
          <option value="approved">Зөвшөөрөгдсөн</option>
          <option value="rejected">Татгалзсан</option>
        </select>
      </div>

      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Хэрэглэгч байхгүй байна</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Нэр / Утас</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">KYC</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Зээлийн эрх</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Кредит оноо</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Бүртгэсэн</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Үйлдэл</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.phoneNumber}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.kycStatus)}`}>
                          {getStatusText(user.kycStatus)}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatMoney(user.creditLimit || 0)}₮
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.creditScore || 0}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.status === 'active' ? 'Идэвхтэй' : 'Блоклогдсон'}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(user.createdAt)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <Link to={`/users/${user._id}`}>
                            <button className="p-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200" title="Дэлгэрэнгүй">
                              <FiEye className="w-4 h-4" />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleBlock(user._id, user.status)}
                            className={`p-1.5 rounded ${
                              user.status === 'active'
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                            title={user.status === 'active' ? 'Блоклох' : 'Идэвхжүүлэх'}
                          >
                            {user.status === 'active' ? <FiLock className="w-4 h-4" /> : <FiUnlock className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200">
                <p className="text-sm text-gray-600">Хуудас {page} / {totalPages}</p>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50">Өмнөх</button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50">Дараах</button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  )
}

export default UserListPage