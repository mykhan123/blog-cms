import { auth } from '@/auth'

export default async function AdminDashboard() {
  const session = await auth()

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2">Dashboard</h1>
      <p className="text-gray-600">Welcome, {session?.user?.name}!</p>
    </div>
  )
}