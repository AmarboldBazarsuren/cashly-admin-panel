import { useParams } from 'react-router-dom'
import Card from '../../components/common/Card'

const UserDetailPage = () => {
  const { userId } = useParams()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Хэрэглэгчийн дэлгэрэнгүй</h1>
        <p className="text-gray-600 mt-1">User ID: {userId}</p>
      </div>

      <Card>
        <div className="text-center py-12">
          <p className="text-gray-500">Хэрэглэгчийн дэлгэрэнгүй мэдээлэл</p>
          <p className="text-sm text-gray-400 mt-2">Энэ хэсэг удахгүй бэлэн болно</p>
        </div>
      </Card>
    </div>
  )
}

export default UserDetailPage
