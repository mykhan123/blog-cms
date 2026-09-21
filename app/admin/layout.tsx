import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-56 bg-gray-900 text-gray-300 flex flex-col p-4">
        <div className="text-white font-semibold text-lg mb-6 px-2">
          Blog CMS
        </div>
        <nav className="flex flex-col gap-1">
          <Link
            href="/admin"
            className="px-3 py-2 rounded-md text-sm hover:bg-gray-800 hover:text-white"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/posts"
            className="px-3 py-2 rounded-md text-sm hover:bg-gray-800 hover:text-white"
          >
            Posts
          </Link>
          <Link
            href="/admin/categories"
            className="px-3 py-2 rounded-md text-sm hover:bg-gray-800 hover:text-white"
          >
            Categories
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}