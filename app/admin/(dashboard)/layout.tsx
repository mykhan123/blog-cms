import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import NavLinks from './NavLinks'
import MobileNav from './MobileNav'

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
    <div className="min-h-screen w-full bg-gray-50">
      {/* Mobile Navigation
          Kept OUTSIDE the desktop flex layout.
          This makes the mobile header use the full viewport width.
      */}
      <MobileNav
        userName={session.user?.name}
        userEmail={session.user?.email}
      />

      <div className="flex min-h-screen w-full min-w-0">
        {/* Desktop Sidebar */}
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-gray-800 bg-gray-950 text-gray-300 md:flex">
          {/* Logo */}
          <div className="flex h-16 items-center border-b border-gray-800 px-6">
            <Link href="/admin" className="group">
              <h1 className="text-lg font-bold tracking-tight text-white">
                Blog CMS
              </h1>

              <p className="text-xs text-gray-500 transition group-hover:text-gray-400">
                Admin Panel
              </p>
            </Link>
          </div>

          {/* Navigation */}
          <NavLinks />

          {/* User */}
          <div className="mt-auto border-t border-gray-800 p-4">
            <div className="rounded-xl bg-gray-900 px-3 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
                  {getInitial(
                    session.user?.name || 'A'
                  )}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {session.user?.name || 'Admin'}
                  </p>

                  <p className="truncate text-xs text-gray-500">
                    {session.user?.email || ''}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="min-h-screen min-w-0 w-full flex-1 md:ml-64">
          <div className="mx-auto w-full max-w-7xl min-w-0 p-3 sm:p-6 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase()
}