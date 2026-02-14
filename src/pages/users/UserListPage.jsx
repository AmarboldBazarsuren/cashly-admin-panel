import Card from '../../components/common/Card'

const UserListPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Хэрэглэгчид</h1>
        <p className="text-gray-600 mt-1">Системд бүртгэгдсэн бүх хэрэглэгчид</p>
      </div>

      <Card>
        <div className="text-center py-12">
          <p className="text-gray-500">Хэрэглэгчдийн жагсаалт</p>
          <p className="text-sm text-gray-400 mt-2">Энэ хэсэг удахгүй бэлэн болно</p>
        </div>
      </Card>
    </div>
  )
}

export default UserListPage
