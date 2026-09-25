'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type MobileNavProps = {
  userName?: string | null
  userEmail?: string | null
}

export default function MobileNav({
  userName,
  userEmail,
}: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const links = [
    {
      href: '/admin',
      label: 'Dashboard',
      icon: (
        <svg
          className="h-5 w-5 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <rect
            x="3"
            y="3"
            width="7"
            height="7"
            rx="1"
          />
          <rect
            x="14"
            y="3"
            width="7"
            height="7"
            rx="1"
          />
          <rect
            x="3"
            y="14"
            width="7"
            height="7"
            rx="1"
          />
          <rect
            x="14"
            y="14"
            width="7"
            height="7"
            rx="1"
          />
        </svg>
      ),
    },

    {
      href: '/admin/posts',
      label: 'Posts',
      icon: (
        <svg
          className="h-5 w-5 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path
            d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17.5A2.5 2.5 0 0 0 17.5 17H4V4.5Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d="M4 17h13.5A2.5 2.5 0 0 1 20 19.5"
            strokeLinecap="round"
          />

          <path
            d="M8 6h8M8 10h8"
            strokeLinecap="round"
          />
        </svg>
      ),
    },

    {
      href: '/admin/categories',
      label: 'Categories',
      icon: (
        <svg
          className="h-5 w-5 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path
            d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11l2 3h4.5A2.5 2.5 0 0 1 20 8.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-12Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
  ]

  function closeMenu() {
    setIsOpen(false)
  }

  function isActive(href: string) {
    return href === '/admin'
      ? pathname === '/admin'
      : pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile Header */}
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-800 bg-gray-950 px-4 shadow-sm md:hidden">
        <Link
          href="/admin"
          onClick={closeMenu}
          className="min-w-0"
        >
          <div>
            <h1 className="text-base font-bold text-white">
              Blog CMS
            </h1>

            <p className="text-[10px] text-gray-400">
              Admin Panel
            </p>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open navigation menu"
          className="shrink-0 rounded-lg p-2 text-gray-300 transition hover:bg-gray-800 hover:text-white"
        >
          <svg
            className="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              d="M4 6h16M4 12h16M4 18h16"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </header>

      {/* Overlay */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={closeMenu}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-gray-950 text-gray-300 shadow-2xl transition-transform duration-300 md:hidden ${
          isOpen
            ? 'translate-x-0'
            : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-800 px-5">
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-white">
              Blog CMS
            </h1>

            <p className="text-xs text-gray-500">
              Admin Panel
            </p>
          </div>

          <button
            type="button"
            onClick={closeMenu}
            aria-label="Close navigation menu"
            className="shrink-0 rounded-lg p-2 text-gray-400 transition hover:bg-gray-900 hover:text-white"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                d="M6 6l12 12M18 6L6 18"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
          {links.map((link) => {
            const active = isActive(link.href)

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${
                  active
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-400 hover:bg-gray-900 hover:text-white'
                }`}
              >
                {link.icon}

                <span>{link.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="shrink-0 border-t border-gray-800 p-4">
          <div className="rounded-xl bg-gray-900 px-3 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
                {getInitial(userName || 'A')}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {userName || 'Admin'}
                </p>

                <p className="truncate text-xs text-gray-500">
                  {userEmail || ''}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase()
}